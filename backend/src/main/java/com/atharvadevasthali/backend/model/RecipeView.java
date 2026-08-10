package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recipe_views", indexes = {
        @Index(name = "idx_recipe_viewed", columnList = "recipe_id,viewed_at"),
        @Index(name = "idx_user_viewed", columnList = "user_id,viewed_at")
})
public class RecipeView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    private LocalDateTime viewedAt = LocalDateTime.now();

    public RecipeView() {}

    public RecipeView(User user, Recipe recipe) {
        this.user = user;
        this.recipe = recipe;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Recipe getRecipe() { return recipe; }
    public LocalDateTime getViewedAt() { return viewedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }
}
