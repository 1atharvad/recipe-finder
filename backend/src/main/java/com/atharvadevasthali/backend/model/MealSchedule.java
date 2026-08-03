package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_schedules")
public class MealSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // EAGER, same reasoning as EatingHistory.recipe — avoids serializing an
    // uninitialized Hibernate proxy when this is returned directly as JSON.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(length = 300)
    private String note;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean completed;

    private LocalDateTime createdAt = LocalDateTime.now();

    public MealSchedule() {}

    public MealSchedule(User user, Recipe recipe, LocalDateTime scheduledAt, String note) {
        this.user = user;
        this.recipe = recipe;
        this.scheduledAt = scheduledAt;
        this.note = note;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Recipe getRecipe() { return recipe; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getNote() { return note; }
    public boolean isCompleted() { return completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public void setNote(String note) { this.note = note; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
