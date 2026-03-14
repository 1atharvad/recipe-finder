package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private int servings;

    @ElementCollection
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    private List<Ingredient> ingredients;

    @ElementCollection
    @CollectionTable(name = "recipe_steps", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "step", length = 1000)
    @OrderColumn(name = "step_order")
    private List<String> steps;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    private DietaryType dietaryType;

    @Enumerated(EnumType.STRING)
    private CuisineType cuisineType;

    public Recipe() {}

    public Recipe(String name, int servings, List<Ingredient> ingredients, List<String> steps) {
        this.name = name;
        this.servings = servings;
        this.ingredients = ingredients;
        this.steps = steps;
    }

    public Recipe(String name, int servings, List<Ingredient> ingredients, List<String> steps,
                  DietaryType dietaryType, CuisineType cuisineType) {
        this.name = name;
        this.servings = servings;
        this.ingredients = ingredients;
        this.steps = steps;
        this.dietaryType = dietaryType;
        this.cuisineType = cuisineType;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public int getServings() { return servings; }
    public List<Ingredient> getIngredients() { return ingredients; }
    public List<String> getSteps() { return steps; }
    public User getOwner() { return owner; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setServings(int servings) { this.servings = servings; }
    public void setIngredients(List<Ingredient> ingredients) { this.ingredients = ingredients; }
    public void setSteps(List<String> steps) { this.steps = steps; }
    public void setOwner(User owner) { this.owner = owner; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
}
