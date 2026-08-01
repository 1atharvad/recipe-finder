package com.atharvadevasthali.backend.dto;

import com.atharvadevasthali.backend.model.Recipe;

import java.util.List;

public class ChatResponse {
    private String reply;
    private List<Recipe> recipes;

    public ChatResponse(String reply, List<Recipe> recipes) {
        this.reply = reply;
        this.recipes = recipes;
    }

    public String getReply() { return reply; }
    public List<Recipe> getRecipes() { return recipes; }
}
