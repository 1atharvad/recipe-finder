package com.atharvadevasthali.backend.dto;

import java.util.List;

public class TrackAiChatRequest {
    private String query;
    private List<Long> recommendedRecipeIds;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public List<Long> getRecommendedRecipeIds() { return recommendedRecipeIds; }
    public void setRecommendedRecipeIds(List<Long> recommendedRecipeIds) { this.recommendedRecipeIds = recommendedRecipeIds; }
}
