package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.ChatMessageDTO;
import com.atharvadevasthali.backend.dto.ChatResponse;
import com.atharvadevasthali.backend.dto.PublicRecipeDTO;
import com.atharvadevasthali.backend.dto.RecipeDraftResponse;
import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.model.*;
import com.atharvadevasthali.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final UserFavoriteRepository favoriteRepository;
    private final EatingHistoryRepository historyRepository;
    private final MealScheduleRepository scheduleRepository;
    private final RecipeEmbeddingService embeddingService;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public RecipeService(RecipeRepository recipeRepository,
                         UserRepository userRepository,
                         UserFavoriteRepository favoriteRepository,
                         EatingHistoryRepository historyRepository,
                         MealScheduleRepository scheduleRepository,
                         RecipeEmbeddingService embeddingService,
                         GeminiClient geminiClient,
                         ObjectMapper objectMapper) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.historyRepository = historyRepository;
        this.scheduleRepository = scheduleRepository;
        this.embeddingService = embeddingService;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    // ── Public ──────────────────────────────────────────────────────────────

    public List<Recipe> getTopGeneralRecipes() {
        return recipeRepository.findTopGeneralByScore(PageRequest.of(0, 6)).getContent();
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

    // Conversational recipe drafting — mirrors chat()'s back-and-forth shape rather
    // than a one-shot form. The user doesn't have to describe the whole dish in one
    // message: "hi" gets a clarifying question back, not a fabricated recipe; once
    // there's enough to work with (here or built up over prior turns), the assistant
    // drafts or updates the recipe. Never writes to the database itself — the
    // frontend only fills RecipeFormModal's fields for review; saving stays separate.
    public RecipeDraftResponse draftRecipe(String message, List<ChatMessageDTO> history, RecipeRequest currentRecipe) {
        if (!geminiClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI drafting is not configured");
        }

        StringBuilder prompt = new StringBuilder();
        if (currentRecipe != null) {
            prompt.append("You are a recipe-writing assistant helping a user EDIT an existing recipe through conversation. ")
                  .append("You are NOT the same assistant that recommends existing recipes — your job is to help REWRITE this one.\n\n")
                  .append("Here is the recipe as it currently stands (JSON):\n");
            try {
                prompt.append(objectMapper.writeValueAsString(currentRecipe)).append("\n\n");
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize current recipe");
            }
            prompt.append("Apply the user's requested change(s) to this recipe and set \"recipe\" to the FULL updated ")
                  .append("recipe (all fields, not just the ones that changed) — never a partial object. Recompute ")
                  .append("nutrition to match the updated ingredients/servings.\n")
                  .append("- If the latest message doesn't request any concrete change (e.g. it's a greeting or unclear), ")
                  .append("do NOT modify the recipe. Respond with a short, friendly question asking what they'd like to ")
                  .append("change, and set \"recipe\" to null.\n\n");
        } else {
            prompt.append("You are a recipe-writing assistant helping a user create a new recipe through conversation. ")
                  .append("You are NOT the same assistant that recommends existing recipes — your job is to help WRITE a new one.\n\n")
                  .append("Figure out if you have enough information to draft a real, specific dish (a dish concept — ")
                  .append("exact measurements aren't required, the user can refine those after).\n")
                  .append("- If the latest message is a greeting, small talk, or too vague to identify a dish (e.g. just ")
                  .append("\"hi\" or \"make me something\"), do NOT invent a random recipe. Respond with a short, friendly ")
                  .append("question inviting them to describe what they'd like to cook, and set \"recipe\" to null.\n")
                  .append("- If a specific dish is identifiable (from this message or earlier in the conversation), write ")
                  .append("a complete recipe for it and set \"recipe\" to that recipe. If this is a refinement to a recipe ")
                  .append("already drafted earlier in the conversation (e.g. \"make it vegan\", \"double it\", \"less spicy\"), ")
                  .append("update that recipe rather than starting over.\n\n");
        }
        prompt.append("Respond with ONLY a single JSON object, no markdown code fences, no surrounding text, shaped ")
              .append("EXACTLY like this:\n")
              .append("{\n")
              .append("  \"reply\": \"<short, friendly message — either your clarifying question, or a one-line confirmation of what you drafted>\",\n")
              .append("  \"recipe\": null OR {\n")
              .append("    \"name\": string,\n")
              .append("    \"servings\": integer,\n")
              .append("    \"ingredients\": [{\"name\": string, \"quantity\": string}],\n")
              .append("    \"steps\": [string, ...] (each a clear, detailed instruction; no leading numbers),\n")
              .append("    \"dietaryType\": one of VEGETARIAN, VEGAN, NON_VEGETARIAN,\n")
              .append("    \"cuisineType\": one of ITALIAN, INDIAN, ASIAN, MEXICAN, OTHER,\n")
              .append("    \"prepTimeMinutes\": integer,\n")
              .append("    \"cookTimeMinutes\": integer,\n")
              .append("    \"difficulty\": one of EASY, MEDIUM, HARD,\n")
              .append("    \"calories\": integer (estimated total calories for the WHOLE recipe, all servings combined),\n")
              .append("    \"proteinGrams\": integer (total grams, whole recipe),\n")
              .append("    \"carbsGrams\": integer (total grams, whole recipe),\n")
              .append("    \"fatGrams\": integer (total grams, whole recipe),\n")
              .append("    \"fiberGrams\": integer (total grams, whole recipe),\n")
              .append("    \"sugarGrams\": integer (total grams, whole recipe),\n")
              .append("    \"sodiumMg\": integer (total milligrams, whole recipe)\n")
              .append("  }\n")
              .append("}\n\n");

        if (history != null) {
            for (ChatMessageDTO m : history) {
                prompt.append(m.getRole()).append(": ").append(m.getContent()).append("\n");
            }
        }
        prompt.append("user: ").append(message).append("\nassistant:");

        String raw = geminiClient.generate(prompt.toString()).trim();
        String json = raw.startsWith("```")
                ? raw.replaceFirst("^```[a-zA-Z]*\\n?", "").replaceFirst("```\\s*$", "").trim()
                : raw;

        try {
            return objectMapper.readValue(json, RecipeDraftResponse.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach the drafting assistant — try again");
        }
    }

    public Recipe getById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }

    /** Same as getById, but 404s if the recipe is private and not visible to the given (possibly anonymous) requester. */
    public Recipe getVisibleById(Long id, String username) {
        Recipe recipe = getById(id);
        boolean visible = recipe.getOwner() == null
                || recipe.getIsPublic()
                || (username != null && recipe.getOwner().getUsername().equals(username));
        if (!visible) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found");
        }
        return recipe;
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

    @Transactional
    public void deleteMyRecipe(String username, Long id) {
        User user = getUser(username);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() == null || !recipe.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your recipe");
        }
        deleteRecipeAndDependents(recipe);
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

    public EatingHistory markAsEaten(String username, Long recipeId, LocalDateTime eatenAt) {
        User user = getUser(username);
        Recipe recipe = getById(recipeId);
        LocalDateTime when = eatenAt != null ? eatenAt : LocalDateTime.now();
        EatingHistory entry = new EatingHistory(user, recipe, when.toLocalDate());
        entry.setRecordedAt(when);
        return historyRepository.save(entry);
    }

    public EatingHistory updateHistoryEntry(String username, Long entryId, LocalDateTime eatenAt) {
        User user = getUser(username);
        EatingHistory entry = historyRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "History entry not found"));
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your history entry");
        }
        LocalDateTime when = eatenAt != null ? eatenAt : LocalDateTime.now();
        entry.setEatenOn(when.toLocalDate());
        entry.setRecordedAt(when);
        return historyRepository.save(entry);
    }

    public void deleteHistoryEntry(String username, Long entryId) {
        User user = getUser(username);
        EatingHistory entry = historyRepository.findById(entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "History entry not found"));
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your history entry");
        }
        historyRepository.delete(entry);
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

    @Transactional
    public void deleteGeneralRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a general recipe");
        }
        deleteRecipeAndDependents(recipe);
    }

    // ── Admin: public recipe moderation ────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PublicRecipeDTO> getPublicUserRecipes() {
        return recipeRepository.findByOwnerIsNotNullAndIsPublicTrue().stream()
                .map(r -> new PublicRecipeDTO(
                        r.getId(), r.getName(), r.getServings(),
                        r.getDietaryType() != null ? r.getDietaryType().name() : null,
                        r.getCuisineType() != null ? r.getCuisineType().name() : null,
                        r.getOwner().getId(),
                        r.getOwner().getFirstName() + " " + r.getOwner().getLastName()
                ))
                .collect(Collectors.toList());
    }

    /** Revokes public visibility on a user's recipe without deleting it or affecting ownership. */
    public void unpublishRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a user recipe");
        }
        recipe.setIsPublic(false);
        recipeRepository.save(recipe);
        embeddingService.deleteEmbedding(recipe.getId());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Deletes a recipe along with every row that references it (favorites, eating history,
     * meal schedules, embedding), since none of those FKs cascade at the DB level.
     */
    private void deleteRecipeAndDependents(Recipe recipe) {
        favoriteRepository.deleteByRecipe(recipe);
        historyRepository.deleteByRecipe(recipe);
        scheduleRepository.deleteByRecipe(recipe);
        embeddingService.deleteEmbedding(recipe.getId());
        recipeRepository.delete(recipe);
    }

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
        recipe.setImageUrl(req.getImageUrl());
        recipe.setSourceName(req.getSourceName());
        recipe.setSourceUrl(req.getSourceUrl());
        recipe.setIsPublic(req.getIsPublic());
        recipe.setPrepTimeMinutes(req.getPrepTimeMinutes());
        recipe.setCookTimeMinutes(req.getCookTimeMinutes());
        recipe.setDifficulty(req.getDifficulty());
        recipe.setCalories(req.getCalories());
        recipe.setProteinGrams(req.getProteinGrams());
        recipe.setCarbsGrams(req.getCarbsGrams());
        recipe.setFatGrams(req.getFatGrams());
        recipe.setFiberGrams(req.getFiberGrams());
        recipe.setSugarGrams(req.getSugarGrams());
        recipe.setSodiumMg(req.getSodiumMg());
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
