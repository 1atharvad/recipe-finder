package com.atharvadevasthali.backend.dto;

public class RecipeCountDTO {
    private Long recipeId;
    private String recipeName;
    private long count;

    public RecipeCountDTO(Long recipeId, String recipeName, long count) {
        this.recipeId = recipeId;
        this.recipeName = recipeName;
        this.count = count;
    }

    public Long getRecipeId() { return recipeId; }
    public String getRecipeName() { return recipeName; }
    public long getCount() { return count; }
}
