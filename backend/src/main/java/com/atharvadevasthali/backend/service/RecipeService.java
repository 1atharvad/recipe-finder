package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.ChatMessageDTO;
import com.atharvadevasthali.backend.dto.ChatResponse;
import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.model.*;
import com.atharvadevasthali.backend.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserFavoriteRepository favoriteRepository;
    private final EatingHistoryRepository historyRepository;
    private final RecipeEmbeddingService embeddingService;
    private final GeminiClient geminiClient;

    public RecipeService(RecipeRepository recipeRepository,
                         UserRepository userRepository,
                         UserFavoriteRepository favoriteRepository,
                         EatingHistoryRepository historyRepository,
                         RecipeEmbeddingService embeddingService,
                         GeminiClient geminiClient) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.historyRepository = historyRepository;
        this.embeddingService = embeddingService;
        this.geminiClient = geminiClient;
    }

    // ── Public ──────────────────────────────────────────────────────────────

    public List<Recipe> getTopGeneralRecipes() {
        return recipeRepository.findByOwnerIsNullOrIsPublicTrue(PageRequest.of(0, 6)).getContent();
    }

    public List<Recipe> searchPublic(String q) {
        return recipeRepository.searchGeneralByNameOrIngredient(q.toLowerCase().trim());
    }

    /** RAG-style natural-language search over the general/public recipe pool. */
    public List<Recipe> smartSearch(String query, int limit) {
        List<Long> ids = embeddingService.similaritySearch(query, limit);
        return ids.stream()
                .map(id -> recipeRepository.findById(id).orElse(null))
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    /**
     * Multi-turn RAG chat: retrieves candidate recipes for the whole conversation so far,
     * then asks Gemini to answer conversationally using only that retrieved context.
     */
    public ChatResponse chat(String message, List<ChatMessageDTO> history) {
        if (!geminiClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI chat is not configured");
        }

        String retrievalQuery = (history == null ? "" : history.stream()
                .filter(m -> "user".equals(m.getRole()))
                .map(ChatMessageDTO::getContent)
                .collect(Collectors.joining(" "))) + " " + message;

        List<Recipe> candidates = smartSearch(retrievalQuery.trim(), 6);

        String context = candidates.isEmpty() ? "No matching recipes were found." : candidates.stream()
                .map(r -> "- " + r.getName() + " (" +
                        (r.getDietaryType() != null ? r.getDietaryType() : "any diet") + ", " +
                        (r.getCuisineType() != null ? r.getCuisineType() : "any cuisine") + "): ingredients " +
                        r.getIngredients().stream().map(Ingredient::getName).collect(Collectors.joining(", ")))
                .collect(Collectors.joining("\n"));

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a friendly recipe assistant for a recipe-finder app. Your reply is inserted directly into ")
              .append("a chat bubble as inline HTML — do not wrap it in <p> or any other container tag, and never use ")
              .append("markdown syntax (no asterisks, no bullet dashes, no headers). For emphasis, you may use only ")
              .append("these inline tags where helpful: <b> for bold, <i> for italics, and <span class=\"hl\"> to ")
              .append("highlight a key dish or ingredient name. Do not use any other tags, attributes, or styles.\n\n")
              .append("Figure out the user's intent first:\n")
              .append("- If their latest message is a greeting, small talk, or not about food/cooking, respond naturally ")
              .append("and briefly (1-2 sentences), invite them to describe what they'd like to cook, and do NOT mention ")
              .append("or list any recipes.\n")
              .append("- If they're asking about food/recipes and relevant recipes are listed below, recommend only from ")
              .append("that list in 2-4 sentences. Never invent a recipe that isn't listed.\n")
              .append("- If they're asking about food/recipes but nothing relevant is listed below, say so briefly and ")
              .append("suggest they rephrase or broaden their request.\n\n")
              .append("Available recipes:\n").append(context).append("\n\n");

        if (history != null) {
            for (ChatMessageDTO m : history) {
                prompt.append(m.getRole()).append(": ").append(m.getContent()).append("\n");
            }
        }
        prompt.append("user: ").append(message).append("\nassistant:");

        String reply = geminiClient.generate(prompt.toString());
        return new ChatResponse(reply, candidates);
    }

    public Recipe getById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }

    // ── Authenticated user search ────────────────────────────────────────────

    public List<Recipe> searchForUser(String q, String username) {
        User user = getUser(username);
        return recipeRepository.searchByNameOrIngredientForUser(q.toLowerCase().trim(), user);
    }

    // ── User's own recipes ───────────────────────────────────────────────────

    public List<Recipe> getMyRecipes(String username) {
        return recipeRepository.findByOwner(getUser(username));
    }

    public Recipe createMyRecipe(String username, RecipeRequest req) {
        User user = getUser(username);
        Recipe recipe = buildRecipe(req);
        recipe.setOwner(user);
        recipe = recipeRepository.save(recipe);
        syncEmbedding(recipe);
        return recipe;
    }

    public Recipe updateMyRecipe(String username, Long id, RecipeRequest req) {
        User user = getUser(username);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() == null || !recipe.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your recipe");
        }
        applyRecipeRequest(recipe, req);
        recipe = recipeRepository.save(recipe);
        syncEmbedding(recipe);
        return recipe;
    }

    public void deleteMyRecipe(String username, Long id) {
        User user = getUser(username);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() == null || !recipe.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your recipe");
        }
        recipeRepository.delete(recipe);
    }

    // ── Favorites ────────────────────────────────────────────────────────────

    public List<Recipe> getFavorites(String username) {
        User user = getUser(username);
        return favoriteRepository.findByUser(user).stream()
                .map(UserFavorite::getRecipe)
                .collect(Collectors.toList());
    }

    public void addFavorite(String username, Long recipeId) {
        User user = getUser(username);
        Recipe recipe = getById(recipeId);
        if (!favoriteRepository.existsByUserAndRecipe(user, recipe)) {
            favoriteRepository.save(new UserFavorite(user, recipe));
        }
    }

    @Transactional
    public void removeFavorite(String username, Long recipeId) {
        User user = getUser(username);
        Recipe recipe = getById(recipeId);
        favoriteRepository.deleteByUserAndRecipe(user, recipe);
    }

    // ── Eating history ───────────────────────────────────────────────────────

    public List<EatingHistory> getHistory(String username) {
        return historyRepository.findByUserOrderByEatenOnDesc(getUser(username));
    }

    public List<EatingHistory> getHistoryForRecipe(String username, Long recipeId) {
        return historyRepository.findByUserAndRecipeOrderByEatenOnDesc(getUser(username), getById(recipeId));
    }

    public EatingHistory markAsEaten(String username, Long recipeId) {
        User user = getUser(username);
        Recipe recipe = getById(recipeId);
        EatingHistory entry = new EatingHistory(user, recipe, LocalDate.now());
        return historyRepository.save(entry);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public List<Recipe> getAllGeneralRecipes() {
        return recipeRepository.findByOwnerIsNull();
    }

    public Recipe createGeneralRecipe(RecipeRequest req) {
        Recipe recipe = recipeRepository.save(buildRecipe(req));
        syncEmbedding(recipe);
        return recipe;
    }

    public Recipe updateGeneralRecipe(Long id, RecipeRequest req) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a general recipe");
        }
        applyRecipeRequest(recipe, req);
        recipe = recipeRepository.save(recipe);
        syncEmbedding(recipe);
        return recipe;
    }

    public void deleteGeneralRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a general recipe");
        }
        recipeRepository.delete(recipe);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Keeps the vector index in sync: indexed when visible (general or public), removed otherwise. */
    private void syncEmbedding(Recipe recipe) {
        if (recipe.getOwner() == null || recipe.getIsPublic()) {
            embeddingService.upsertEmbedding(recipe);
        } else {
            embeddingService.deleteEmbedding(recipe.getId());
        }
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Recipe buildRecipe(RecipeRequest req) {
        Recipe recipe = new Recipe();
        applyRecipeRequest(recipe, req);
        return recipe;
    }

    private void applyRecipeRequest(Recipe recipe, RecipeRequest req) {
        recipe.setName(req.getName());
        recipe.setServings(req.getServings());
        recipe.setDietaryType(req.getDietaryType());
        recipe.setCuisineType(req.getCuisineType());
        recipe.setVideoUrl(req.getVideoUrl());
        recipe.setIsPublic(req.getIsPublic());
        if (req.getIngredients() != null) {
            recipe.setIngredients(req.getIngredients().stream()
                    .map(dto -> {
                        Ingredient ing = new Ingredient();
                        ing.setName(dto.getName());
                        ing.setQuantity(dto.getQuantity());
                        return ing;
                    })
                    .collect(Collectors.toList()));
        }
        if (req.getSteps() != null) {
            recipe.setSteps(req.getSteps());
        }
    }
}
