package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.model.Recipe;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RecipeController {
    private List<Recipe> recipes = new ArrayList<>();

    @PostConstruct
    public void loadData() {
        recipes = List.of(
            new Recipe(1, "Tomato Pasta", List.of("tomato", "pasta", "onion", "garlic"),
                "Boil pasta, cook tomato sauce, mix together."),
            new Recipe(2, "Veggie Salad", List.of("lettuce", "tomato", "cucumber", "olive oil"),
                "Chop veggies, mix, and drizzle olive oil.")
        );
    }

    @PostMapping("/recipes")
    public List<Recipe> getRecipes(@RequestBody List<String> ingredients) {
        return recipes.stream()
            .filter(r -> r.getIngredients().stream().allMatch(i -> ingredients.contains(i)))
            .collect(Collectors.toList());
    }

    // Optional: Favorites API
    private List<Recipe> favorites = new ArrayList<>();

    @PostMapping("/favorites")
    public void addFavorite(@RequestBody Recipe recipe) {
        favorites.add(recipe);
    }

    @GetMapping("/favorites")
    public List<Recipe> getFavorites() {
        return favorites;
    }
}
