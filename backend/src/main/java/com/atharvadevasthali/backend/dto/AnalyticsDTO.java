package com.atharvadevasthali.backend.dto;

import java.util.List;

public class AnalyticsDTO {
    private long totalUsers;
    private long totalGeneralRecipes;
    private long totalPublicUserRecipes;
    private long totalFavorites;
    private long totalHistoryEntries;
    private long totalRecipeViews;
    private long totalSearches;
    private long totalAiChats;
    private Double aiAcceptanceRate;
    private List<RecipeCountDTO> topFavorited;
    private List<RecipeCountDTO> topCooked;

    public AnalyticsDTO(long totalUsers, long totalGeneralRecipes, long totalPublicUserRecipes,
                         long totalFavorites, long totalHistoryEntries,
                         long totalRecipeViews, long totalSearches, long totalAiChats, Double aiAcceptanceRate,
                         List<RecipeCountDTO> topFavorited, List<RecipeCountDTO> topCooked) {
        this.totalUsers = totalUsers;
        this.totalGeneralRecipes = totalGeneralRecipes;
        this.totalPublicUserRecipes = totalPublicUserRecipes;
        this.totalFavorites = totalFavorites;
        this.totalHistoryEntries = totalHistoryEntries;
        this.totalRecipeViews = totalRecipeViews;
        this.totalSearches = totalSearches;
        this.totalAiChats = totalAiChats;
        this.aiAcceptanceRate = aiAcceptanceRate;
        this.topFavorited = topFavorited;
        this.topCooked = topCooked;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalGeneralRecipes() { return totalGeneralRecipes; }
    public long getTotalPublicUserRecipes() { return totalPublicUserRecipes; }
    public long getTotalFavorites() { return totalFavorites; }
    public long getTotalHistoryEntries() { return totalHistoryEntries; }
    public long getTotalRecipeViews() { return totalRecipeViews; }
    public long getTotalSearches() { return totalSearches; }
    public long getTotalAiChats() { return totalAiChats; }
    public Double getAiAcceptanceRate() { return aiAcceptanceRate; }
    public List<RecipeCountDTO> getTopFavorited() { return topFavorited; }
    public List<RecipeCountDTO> getTopCooked() { return topCooked; }
}
