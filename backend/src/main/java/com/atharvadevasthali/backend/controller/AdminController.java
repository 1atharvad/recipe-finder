package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.AdminUserDTO;
import com.atharvadevasthali.backend.dto.AnalyticsDTO;
import com.atharvadevasthali.backend.dto.EmbeddingStatusDTO;
import com.atharvadevasthali.backend.dto.PublicRecipeDTO;
import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.dto.UpdateEnabledRequest;
import com.atharvadevasthali.backend.dto.UpdatePremiumAccessRequest;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.service.AdminAnalyticsService;
import com.atharvadevasthali.backend.service.RecipeEmbeddingService;
import com.atharvadevasthali.backend.service.RecipeService;
import com.atharvadevasthali.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final RecipeService recipeService;
    private final UserService userService;
    private final AdminAnalyticsService analyticsService;
    private final RecipeEmbeddingService embeddingService;

    public AdminController(RecipeService recipeService,
                            UserService userService,
                            AdminAnalyticsService analyticsService,
                            RecipeEmbeddingService embeddingService) {
        this.recipeService = recipeService;
        this.userService = userService;
        this.analyticsService = analyticsService;
        this.embeddingService = embeddingService;
    }

    // ── General recipe pool CRUD ────────────────────────────────────────────

    @GetMapping("/recipes")
    public List<Recipe> getAllGeneralRecipes() {
        return recipeService.getAllGeneralRecipes();
    }

    @PostMapping("/recipes")
    public ResponseEntity<Recipe> createRecipe(@Valid @RequestBody RecipeRequest req) {
        return ResponseEntity.status(201).body(recipeService.createGeneralRecipe(req));
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable Long id,
                                               @Valid @RequestBody RecipeRequest req) {
        return ResponseEntity.ok(recipeService.updateGeneralRecipe(id, req));
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteGeneralRecipe(id);
        return ResponseEntity.noContent().build();
    }

    // ── Public user-recipe moderation ───────────────────────────────────────

    @GetMapping("/public-recipes")
    public List<PublicRecipeDTO> getPublicUserRecipes() {
        return recipeService.getPublicUserRecipes();
    }

    @PutMapping("/public-recipes/{id}/unpublish")
    public ResponseEntity<Void> unpublishRecipe(@PathVariable Long id) {
        recipeService.unpublishRecipe(id);
        return ResponseEntity.noContent().build();
    }

    // ── User management ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public List<AdminUserDTO> getUsers() {
        return userService.getAllUsersForAdmin();
    }

    @PutMapping("/users/{id}/enabled")
    public ResponseEntity<Void> setUserEnabled(@PathVariable Long id, @RequestBody UpdateEnabledRequest req) {
        userService.setUserEnabled(id, req.isEnabled());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/premium")
    public ResponseEntity<Void> setUserPremiumAccess(@PathVariable Long id, @RequestBody UpdatePremiumAccessRequest req) {
        userService.setUserPremiumAccess(id, req.isPremiumAccess());
        return ResponseEntity.noContent().build();
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public AnalyticsDTO getAnalytics() {
        return analyticsService.getAnalytics();
    }

    // ── Embeddings ────────────────────────────────────────────────────────────

    @GetMapping("/embeddings/status")
    public EmbeddingStatusDTO getEmbeddingStatus() {
        return embeddingService.getStatus();
    }

    @PostMapping("/embeddings/backfill")
    public ResponseEntity<Void> triggerBackfill() {
        embeddingService.backfillMissingEmbeddings();
        return ResponseEntity.noContent().build();
    }
}
