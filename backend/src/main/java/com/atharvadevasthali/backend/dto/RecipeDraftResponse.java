package com.atharvadevasthali.backend.dto;

public class RecipeDraftResponse {
    private String reply;
    private RecipeRequest recipe;

    public RecipeDraftResponse() {}

    public RecipeDraftResponse(String reply, RecipeRequest recipe) {
        this.reply = reply;
        this.recipe = recipe;
    }

    public String getReply() { return reply; }
    public RecipeRequest getRecipe() { return recipe; }
    public void setReply(String reply) { this.reply = reply; }
    public void setRecipe(RecipeRequest recipe) { this.recipe = recipe; }
}
