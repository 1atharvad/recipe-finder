package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.RecipeRequest;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.service.RecipeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final RecipeService recipeService;

    public AdminController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

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
}
