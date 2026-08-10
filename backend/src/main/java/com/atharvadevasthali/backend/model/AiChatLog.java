package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_logs", indexes = {
        @Index(name = "idx_user_ai", columnList = "user_id,responded_at"),
        @Index(name = "idx_ai_time", columnList = "responded_at")
})
public class AiChatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 1000)
    private String query;

    @Column(columnDefinition = "TEXT")
    private String recommendedRecipeIds;

    private Boolean userAccepted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_recipe_id")
    private Recipe acceptedRecipe;

    private LocalDateTime respondedAt = LocalDateTime.now();

    public AiChatLog() {}

    public AiChatLog(User user, String query, String recommendedRecipeIds) {
        this.user = user;
        this.query = query;
        this.recommendedRecipeIds = recommendedRecipeIds;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getQuery() { return query; }
    public String getRecommendedRecipeIds() { return recommendedRecipeIds; }
    public Boolean getUserAccepted() { return userAccepted; }
    public Recipe getAcceptedRecipe() { return acceptedRecipe; }
    public LocalDateTime getRespondedAt() { return respondedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setQuery(String query) { this.query = query; }
    public void setRecommendedRecipeIds(String recommendedRecipeIds) { this.recommendedRecipeIds = recommendedRecipeIds; }
    public void setUserAccepted(Boolean userAccepted) { this.userAccepted = userAccepted; }
    public void setAcceptedRecipe(Recipe acceptedRecipe) { this.acceptedRecipe = acceptedRecipe; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
