package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    private DietaryType dietaryType;

    @Enumerated(EnumType.STRING)
    private CuisineType cuisineType;

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
}
