package com.atharvadevasthali.backend.dto;

import java.util.List;

public class AnalyticsDTO {
    private long totalUsers;
    private long totalGeneralRecipes;
    private long totalPublicUserRecipes;
    private long totalFavorites;
    private long totalHistoryEntries;
    private List<RecipeCountDTO> topFavorited;
    private List<RecipeCountDTO> topCooked;

    public AnalyticsDTO(long totalUsers, long totalGeneralRecipes, long totalPublicUserRecipes,
                         long totalFavorites, long totalHistoryEntries,
                         List<RecipeCountDTO> topFavorited, List<RecipeCountDTO> topCooked) {
        this.totalUsers = totalUsers;
        this.totalGeneralRecipes = totalGeneralRecipes;
        this.totalPublicUserRecipes = totalPublicUserRecipes;
        this.totalFavorites = totalFavorites;
        this.totalHistoryEntries = totalHistoryEntries;
        this.topFavorited = topFavorited;
        this.topCooked = topCooked;
    }

    public long getTotalUsers() { return totalUsers; }
    public long getTotalGeneralRecipes() { return totalGeneralRecipes; }
    public long getTotalPublicUserRecipes() { return totalPublicUserRecipes; }
    public long getTotalFavorites() { return totalFavorites; }
    public long getTotalHistoryEntries() { return totalHistoryEntries; }
    public List<RecipeCountDTO> getTopFavorited() { return topFavorited; }
    public List<RecipeCountDTO> getTopCooked() { return topCooked; }
}
