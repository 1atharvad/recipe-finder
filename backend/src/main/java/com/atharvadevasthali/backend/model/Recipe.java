package com.atharvadevasthali.backend.model;

import java.util.List;

public class Recipe {
    private int id;
    private String name;
    private List<String> ingredients;
    private String instructions;

    public Recipe() {}

    public Recipe(int id, String name, List<String> ingredients, String instructions) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
        this.instructions = instructions;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public List<String> getIngredients() { return ingredients; }
    public String getInstructions() { return instructions; }

    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setIngredients(List<String> ingredients) { this.ingredients = ingredients; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
