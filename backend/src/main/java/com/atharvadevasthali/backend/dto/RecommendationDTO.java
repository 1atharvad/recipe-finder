package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.CuisineType;
import com.atharvadevasthali.backend.model.DietaryType;
import com.atharvadevasthali.backend.model.Ingredient;

import java.util.List;

public class RecommendationDTO {
    private Long id;
    private String name;
    private int servings;
    private List<Ingredient> ingredients;
    private List<String> steps;
    private DietaryType dietaryType;
    private CuisineType cuisineType;
    private double score;

    public RecommendationDTO(Long id, String name, int servings,
                              List<Ingredient> ingredients, List<String> steps,
                              DietaryType dietaryType, CuisineType cuisineType, double score) {
        this.id = id;
        this.name = name;
        this.servings = servings;
        this.ingredients = ingredients;
        this.steps = steps;
        this.dietaryType = dietaryType;
        this.cuisineType = cuisineType;
        this.score = score;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public int getServings() { return servings; }
    public List<Ingredient> getIngredients() { return ingredients; }
    public List<String> getSteps() { return steps; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }
    public double getScore() { return score; }
}
