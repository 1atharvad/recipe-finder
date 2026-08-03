package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.ChatRequest;
import com.atharvadevasthali.backend.dto.ChatResponse;
import com.atharvadevasthali.backend.dto.MarkEatenRequest;
import com.atharvadevasthali.backend.dto.PreferencesRequest;
import com.atharvadevasthali.backend.dto.RecipeDraftRequest;
import com.atharvadevasthali.backend.dto.RecipeDraftResponse;
import com.atharvadevasthali.backend.dto.RecommendationDTO;
import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.UserPreferences;
import com.atharvadevasthali.backend.service.RecommendationService;
import com.atharvadevasthali.backend.service.RecipeService;
import com.atharvadevasthali.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
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

    @GetMapping("/recipes/smart-search")
    public List<Recipe> smartSearch(@RequestParam String q, @RequestParam(defaultValue = "10") int limit,
                                     Authentication auth) {
        requirePremium(auth);
        return recipeService.smartSearch(q, limit);
    }

    @PostMapping("/recipes/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest req, Authentication auth) {
        requirePremium(auth);
        return recipeService.chat(req.getMessage(), req.getHistory());
    }

    @PostMapping("/recipes/draft")
    public RecipeDraftResponse draftRecipe(@Valid @RequestBody RecipeDraftRequest req, Authentication auth) {
        requirePremium(auth);
        return recipeService.draftRecipe(req.getMessage(), req.getHistory(), req.getCurrentRecipe());
    }

    // Gemini-backed endpoints cost money per call — require a logged-in user with
    // premiumAccess (admin-granted for now; see UserService/AdminController), or
    // an admin, since admin already controls billing and needs these to manage
    // the catalog (e.g. AI-drafting recipes from the admin dashboard).
    private void requirePremium(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium access required");
        }
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !userService.hasPremiumAccess(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium access required");
        }
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id, Authentication auth) {
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;
        return ResponseEntity.ok(recipeService.getVisibleById(id, username));
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
                                                      @RequestBody(required = false) MarkEatenRequest req,
                                                      Authentication auth) {
        var eatenAt = req != null ? req.getEatenAt() : null;
        return ResponseEntity.status(201).body(recipeService.markAsEaten(auth.getName(), recipeId, eatenAt));
    }

    @GetMapping("/history")
    public List<EatingHistory> getHistory(Authentication auth) {
        return recipeService.getHistory(auth.getName());
    }

    @GetMapping("/history/{recipeId}")
    public List<EatingHistory> getHistoryForRecipe(@PathVariable Long recipeId, Authentication auth) {
        return recipeService.getHistoryForRecipe(auth.getName(), recipeId);
    }

    @PutMapping("/history/entries/{entryId}")
    public EatingHistory updateHistoryEntry(@PathVariable Long entryId,
                                             @RequestBody(required = false) MarkEatenRequest req,
                                             Authentication auth) {
        var eatenAt = req != null ? req.getEatenAt() : null;
        return recipeService.updateHistoryEntry(auth.getName(), entryId, eatenAt);
    }

    @DeleteMapping("/history/entries/{entryId}")
    public ResponseEntity<Void> deleteHistoryEntry(@PathVariable Long entryId, Authentication auth) {
        recipeService.deleteHistoryEntry(auth.getName(), entryId);
        return ResponseEntity.noContent().build();
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
