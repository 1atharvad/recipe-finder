package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.CuisineType;
import com.atharvadevasthali.backend.model.DietaryType;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class RecipeRequest {

    @NotBlank
    private String name;

    private int servings;

    private List<IngredientDTO> ingredients;

    private List<String> steps;

    private DietaryType dietaryType;

    private CuisineType cuisineType;

    public String getName() { return name; }
    public int getServings() { return servings; }
    public List<IngredientDTO> getIngredients() { return ingredients; }
    public List<String> getSteps() { return steps; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }

    public void setName(String name) { this.name = name; }
    public void setServings(int servings) { this.servings = servings; }
    public void setIngredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; }
    public void setSteps(List<String> steps) { this.steps = steps; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
}
