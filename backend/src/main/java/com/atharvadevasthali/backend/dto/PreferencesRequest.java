package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.CuisineType;
import com.atharvadevasthali.backend.model.DietaryType;

public class PreferencesRequest {
    private DietaryType dietaryType;
    private CuisineType cuisineType;

    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }

    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
}
