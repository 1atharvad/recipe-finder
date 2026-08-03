package com.atharvadevasthali.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

// Same shape as ChatRequest — this is a conversation, not a one-shot form
// submission. The user doesn't need to describe the whole dish in one message;
// they go back and forth ("hi" -> assistant asks what to cook -> "shrimp pasta"
// -> assistant drafts one -> "make it vegan" -> assistant updates it).
public class RecipeDraftRequest {

    @NotBlank
    private String message;

    private List<ChatMessageDTO> history;

    // Set only when drafting is being used to edit an already-saved recipe
    // (RecipeFormModal in edit mode) — seeds the prompt with the recipe as it
    // currently stands so the assistant edits it instead of starting fresh.
    private RecipeRequest currentRecipe;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatMessageDTO> getHistory() { return history; }
    public void setHistory(List<ChatMessageDTO> history) { this.history = history; }
    public RecipeRequest getCurrentRecipe() { return currentRecipe; }
    public void setCurrentRecipe(RecipeRequest currentRecipe) { this.currentRecipe = currentRecipe; }
}
