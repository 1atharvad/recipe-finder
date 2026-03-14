package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_favorites",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "recipe_id"}))
public class UserFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    private LocalDateTime savedAt = LocalDateTime.now();

    public UserFavorite() {}

    public UserFavorite(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Recipe getRecipe() { return recipe; }
    public LocalDateTime getSavedAt() { return savedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
