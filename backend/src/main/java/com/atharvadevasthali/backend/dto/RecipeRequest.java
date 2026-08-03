package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.CuisineType;
import com.atharvadevasthali.backend.model.DietaryType;
import com.atharvadevasthali.backend.model.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class RecipeRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Min(0)
    private int servings;

    @Valid
    private List<IngredientDTO> ingredients;

    private List<@Size(max = 1000) String> steps;

    private DietaryType dietaryType;

    private CuisineType cuisineType;

    @Size(max = 500)
    private String videoUrl;

    @Size(max = 500)
    private String imageUrl;

    @Size(max = 200)
    private String sourceName;

    @Size(max = 500)
    private String sourceUrl;

    private boolean isPublic;

    @Min(0)
    private Integer prepTimeMinutes;

    @Min(0)
    private Integer cookTimeMinutes;

    private Difficulty difficulty;

    public String getName() { return name; }
    public int getServings() { return servings; }
    public List<IngredientDTO> getIngredients() { return ingredients; }
    public List<String> getSteps() { return steps; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }
    public String getVideoUrl() { return videoUrl; }
    public String getImageUrl() { return imageUrl; }
    public String getSourceName() { return sourceName; }
    public String getSourceUrl() { return sourceUrl; }
    public boolean getIsPublic() { return isPublic; }
    public Integer getPrepTimeMinutes() { return prepTimeMinutes; }
    public Integer getCookTimeMinutes() { return cookTimeMinutes; }
    public Difficulty getDifficulty() { return difficulty; }

    public void setName(String name) { this.name = name; }
    public void setServings(int servings) { this.servings = servings; }
    public void setIngredients(List<IngredientDTO> ingredients) { this.ingredients = ingredients; }
    public void setSteps(List<String> steps) { this.steps = steps; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public void setIsPublic(boolean isPublic) { this.isPublic = isPublic; }
    public void setPrepTimeMinutes(Integer prepTimeMinutes) { this.prepTimeMinutes = prepTimeMinutes; }
    public void setCookTimeMinutes(Integer cookTimeMinutes) { this.cookTimeMinutes = cookTimeMinutes; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
}
