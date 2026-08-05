package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.CuisineType;
import com.atharvadevasthali.backend.model.DietaryType;

public class PreferencesRequest {
    private DietaryType dietaryType;
    private CuisineType cuisineType;
    private Integer calorieGoal;
    private Integer proteinGoal;
    private Integer carbsGoal;
    private Integer fatGoal;

    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }
    public Integer getCalorieGoal() { return calorieGoal; }
    public Integer getProteinGoal() { return proteinGoal; }
    public Integer getCarbsGoal() { return carbsGoal; }
    public Integer getFatGoal() { return fatGoal; }

    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
    public void setCalorieGoal(Integer calorieGoal) { this.calorieGoal = calorieGoal; }
    public void setProteinGoal(Integer proteinGoal) { this.proteinGoal = proteinGoal; }
    public void setCarbsGoal(Integer carbsGoal) { this.carbsGoal = carbsGoal; }
    public void setFatGoal(Integer fatGoal) { this.fatGoal = fatGoal; }
}
