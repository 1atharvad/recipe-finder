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

    // Daily nutrition goals for the Nutrition Analysis dashboard page. Nullable —
    // unset until the user opts in, and no columnDefinition needed since a
    // nullable column adds cleanly to the existing table via Hibernate's schema update.
    private Integer calorieGoal;
    private Integer proteinGoal;
    private Integer carbsGoal;
    private Integer fatGoal;

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public DietaryType getDietaryType() { return dietaryType; }
    public CuisineType getCuisineType() { return cuisineType; }
    public Integer getCalorieGoal() { return calorieGoal; }
    public Integer getProteinGoal() { return proteinGoal; }
    public Integer getCarbsGoal() { return carbsGoal; }
    public Integer getFatGoal() { return fatGoal; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public void setCuisineType(CuisineType cuisineType) { this.cuisineType = cuisineType; }
    public void setCalorieGoal(Integer calorieGoal) { this.calorieGoal = calorieGoal; }
    public void setProteinGoal(Integer proteinGoal) { this.proteinGoal = proteinGoal; }
    public void setCarbsGoal(Integer carbsGoal) { this.carbsGoal = carbsGoal; }
    public void setFatGoal(Integer fatGoal) { this.fatGoal = fatGoal; }
}
