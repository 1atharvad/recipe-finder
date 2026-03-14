package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.RecommendationDTO;
import com.atharvadevasthali.backend.model.*;
import com.atharvadevasthali.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final EatingHistoryRepository historyRepository;
    private final RecipeRepository recipeRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    public RecommendationService(EatingHistoryRepository historyRepository,
                                  RecipeRepository recipeRepository,
                                  UserPreferencesRepository preferencesRepository,
                                  UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.recipeRepository = recipeRepository;
        this.preferencesRepository = preferencesRepository;
        this.userRepository = userRepository;
    }

    public List<RecommendationDTO> getRecommendations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Recipe> generalRecipes = recipeRepository.findByOwnerIsNull();
        List<EatingHistory> history = historyRepository.findByUser(user);
        UserPreferences prefs = preferencesRepository.findByUser(user).orElse(null);

        return generalRecipes.stream()
                .map(recipe -> {
                    double score = dayAffinity(recipe, history)
                            + frequencyWeight(recipe, history)
                            - recencyPenalty(recipe, history)
                            + preferenceBonus(recipe, prefs);
                    return new RecommendationDTO(
                            recipe.getId(),
                            recipe.getName(),
                            recipe.getServings(),
                            recipe.getIngredients(),
                            recipe.getSteps(),
                            recipe.getDietaryType(),
                            recipe.getCuisineType(),
                            Math.round(score * 100.0) / 100.0
                    );
                })
                .sorted(Comparator.comparingDouble(RecommendationDTO::getScore).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private double dayAffinity(Recipe recipe, List<EatingHistory> history) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        long totalDaysWithHistory = history.stream()
                .map(EatingHistory::getEatenOn)
                .distinct()
                .count();
        if (totalDaysWithHistory == 0) return 0.0;

        long dayCount = history.stream()
                .filter(h -> h.getRecipe().getId().equals(recipe.getId()))
                .filter(h -> h.getEatenOn().getDayOfWeek() == today)
                .count();
        return (double) dayCount / totalDaysWithHistory;
    }

    private double recencyPenalty(Recipe recipe, List<EatingHistory> history) {
        Optional<LocalDate> lastEaten = history.stream()
                .filter(h -> h.getRecipe().getId().equals(recipe.getId()))
                .map(EatingHistory::getEatenOn)
                .max(Comparator.naturalOrder());
        if (lastEaten.isEmpty()) return 0.0;

        long daysSince = ChronoUnit.DAYS.between(lastEaten.get(), LocalDate.now());
        if (daysSince >= 7) return 0.0;
        return (7.0 - daysSince) / 7.0;
    }

    private double frequencyWeight(Recipe recipe, List<EatingHistory> history) {
        long recipeCount = history.stream()
                .filter(h -> h.getRecipe().getId().equals(recipe.getId()))
                .count();
        if (recipeCount == 0) return 0.0;

        long maxCount = history.stream()
                .collect(Collectors.groupingBy(
                        h -> h.getRecipe().getId(), Collectors.counting()))
                .values().stream()
                .mapToLong(Long::longValue)
                .max()
                .orElse(1L);
        return (double) recipeCount / maxCount;
    }

    private double preferenceBonus(Recipe recipe, UserPreferences prefs) {
        if (prefs == null) return 0.0;
        double bonus = 0.0;
        if (prefs.getDietaryType() != null && prefs.getDietaryType() == recipe.getDietaryType()) {
            bonus += 0.5;
        }
        if (prefs.getCuisineType() != null && prefs.getCuisineType() == recipe.getCuisineType()) {
            bonus += 0.3;
        }
        return bonus;
    }
}
