package com.atharvadevasthali.backend.dto;

public class PublicRecipeDTO {
    private Long id;
    private String name;
    private int servings;
    private String dietaryType;
    private String cuisineType;
    private Long ownerId;
    private String ownerName;

    public PublicRecipeDTO(Long id, String name, int servings, String dietaryType, String cuisineType,
                            Long ownerId, String ownerName) {
        this.id = id;
        this.name = name;
        this.servings = servings;
        this.dietaryType = dietaryType;
        this.cuisineType = cuisineType;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public int getServings() { return servings; }
    public String getDietaryType() { return dietaryType; }
    public String getCuisineType() { return cuisineType; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerName() { return ownerName; }
}
