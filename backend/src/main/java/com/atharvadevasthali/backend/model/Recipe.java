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

    @Column(length = 500)
    private String videoUrl;

    private Integer prepTimeMinutes;

    private Integer cookTimeMinutes;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    // User/admin-supplied image URL. Falls back to a name-keyed Unsplash lookup
    // (and then a generic placeholder) on the frontend when this is unset.
    @Column(length = 500)
    private String imageUrl;

    // Attribution for a recipe adapted from an external site (e.g. Allrecipes,
    // Sanjeev Kapoor Recipes, TarlaDalal) — optional, shown on the recipe page
    // when set. Not meaningful for genuinely original user-written recipes.
    @Column(length = 200)
    private String sourceName;

    @Column(length = 500)
    private String sourceUrl;

    // Only meaningful when owner is set — lets a user opt a private recipe
    // into the general/search pool while keeping their ownership/edit rights.
    // Explicit default so Hibernate's schema update can add this NOT NULL
    // column to an already-populated table without failing.
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isPublic;

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
    public String getVideoUrl() { return videoUrl; }
    public String getImageUrl() { return imageUrl; }
    public String getSourceName() { return sourceName; }
    public String getSourceUrl() { return sourceUrl; }
    public boolean getIsPublic() { return isPublic; }
    public Integer getPrepTimeMinutes() { return prepTimeMinutes; }
    public Integer getCookTimeMinutes() { return cookTimeMinutes; }
    public Difficulty getDifficulty() { return difficulty; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setServings(int servings) { this.servings = servings; }
    public void setIngredients(List<Ingredient> ingredients) { this.ingredients = ingredients; }
    public void setSteps(List<String> steps) { this.steps = steps; }
    public void setOwner(User owner) { this.owner = owner; }
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
