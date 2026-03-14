package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.PreferencesRequest;
import com.atharvadevasthali.backend.dto.RecommendationDTO;
import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.UserPreferences;
import com.atharvadevasthali.backend.service.RecommendationService;
import com.atharvadevasthali.backend.service.RecipeService;
import com.atharvadevasthali.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class RecipeController {

    private final RecipeService recipeService;
    private final UserService userService;
    private final RecommendationService recommendationService;

    public RecipeController(RecipeService recipeService,
                             UserService userService,
                             RecommendationService recommendationService) {
        this.recipeService = recipeService;
        this.userService = userService;
        this.recommendationService = recommendationService;
    }

    // ── Public endpoints ─────────────────────────────────────────────────────

    @GetMapping("/recipes")
    public List<Recipe> getTopRecipes() {
        return recipeService.getTopGeneralRecipes();
    }

    @GetMapping("/recipes/search")
    public List<Recipe> searchRecipes(@RequestParam String q, Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            return recipeService.searchForUser(q, auth.getName());
        }
        return recipeService.searchPublic(q);
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getById(id));
    }

    // ── Favorites ────────────────────────────────────────────────────────────

    @GetMapping("/favorites")
    public List<Recipe> getFavorites(Authentication auth) {
        return recipeService.getFavorites(auth.getName());
    }

    @PostMapping("/favorites/{recipeId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long recipeId, Authentication auth) {
        recipeService.addFavorite(auth.getName(), recipeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{recipeId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long recipeId, Authentication auth) {
        recipeService.removeFavorite(auth.getName(), recipeId);
        return ResponseEntity.noContent().build();
    }

    // ── My Recipes ───────────────────────────────────────────────────────────

    @GetMapping("/my-recipes")
    public List<Recipe> getMyRecipes(Authentication auth) {
        return recipeService.getMyRecipes(auth.getName());
    }

    @PostMapping("/my-recipes")
    public ResponseEntity<Recipe> createMyRecipe(@Valid @RequestBody RecipeRequest req,
                                                  Authentication auth) {
        return ResponseEntity.status(201).body(recipeService.createMyRecipe(auth.getName(), req));
    }

    @PutMapping("/my-recipes/{id}")
    public ResponseEntity<Recipe> updateMyRecipe(@PathVariable Long id,
                                                  @Valid @RequestBody RecipeRequest req,
                                                  Authentication auth) {
        return ResponseEntity.ok(recipeService.updateMyRecipe(auth.getName(), id, req));
    }

    @DeleteMapping("/my-recipes/{id}")
    public ResponseEntity<Void> deleteMyRecipe(@PathVariable Long id, Authentication auth) {
        recipeService.deleteMyRecipe(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Eating History ───────────────────────────────────────────────────────

    @PostMapping("/history/{recipeId}")
    public ResponseEntity<EatingHistory> markAsEaten(@PathVariable Long recipeId,
                                                      Authentication auth) {
        return ResponseEntity.status(201).body(recipeService.markAsEaten(auth.getName(), recipeId));
    }

    @GetMapping("/history")
    public List<EatingHistory> getHistory(Authentication auth) {
        return recipeService.getHistory(auth.getName());
    }

    // ── Recommendations ──────────────────────────────────────────────────────

    @GetMapping("/recommendations")
    public List<RecommendationDTO> getRecommendations(Authentication auth) {
        return recommendationService.getRecommendations(auth.getName());
    }

    // ── Preferences ──────────────────────────────────────────────────────────

    @GetMapping("/preferences")
    public ResponseEntity<UserPreferences> getPreferences(Authentication auth) {
        return ResponseEntity.ok(userService.getPreferences(auth.getName()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserPreferences> savePreferences(@RequestBody PreferencesRequest req,
                                                            Authentication auth) {
        return ResponseEntity.ok(userService.savePreferences(auth.getName(), req));
    }
}
