package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.IngredientDTO;
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

    public RecipeService(RecipeRepository recipeRepository,
                         UserRepository userRepository,
                         UserFavoriteRepository favoriteRepository,
                         EatingHistoryRepository historyRepository) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.historyRepository = historyRepository;
    }

    // ── Public ──────────────────────────────────────────────────────────────

    public List<Recipe> getTopGeneralRecipes() {
        return recipeRepository.findByOwnerIsNull(PageRequest.of(0, 6)).getContent();
    }

    public List<Recipe> searchPublic(String q) {
        return recipeRepository.searchGeneralByNameOrIngredient(q.toLowerCase().trim());
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
        return recipeRepository.save(recipe);
    }

    public Recipe updateMyRecipe(String username, Long id, RecipeRequest req) {
        User user = getUser(username);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() == null || !recipe.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your recipe");
        }
        applyRecipeRequest(recipe, req);
        return recipeRepository.save(recipe);
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
        return recipeRepository.save(buildRecipe(req));
    }

    public Recipe updateGeneralRecipe(Long id, RecipeRequest req) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        if (recipe.getOwner() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a general recipe");
        }
        applyRecipeRequest(recipe, req);
        return recipeRepository.save(recipe);
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
