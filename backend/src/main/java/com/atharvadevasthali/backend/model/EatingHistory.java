package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "eating_history")
public class EatingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private LocalDate eatenOn;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public EatingHistory() {}

    public EatingHistory(User user, Recipe recipe, LocalDate eatenOn) {
        this.user = user;
        this.recipe = recipe;
        this.eatenOn = eatenOn;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Recipe getRecipe() { return recipe; }
    public LocalDate getEatenOn() { return eatenOn; }
    public LocalDateTime getRecordedAt() { return recordedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
    public void setEatenOn(LocalDate eatenOn) { this.eatenOn = eatenOn; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
