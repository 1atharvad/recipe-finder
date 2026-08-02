package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.AnalyticsDTO;
import com.atharvadevasthali.backend.repository.EatingHistoryRepository;
import com.atharvadevasthali.backend.repository.RecipeRepository;
import com.atharvadevasthali.backend.repository.UserFavoriteRepository;
import com.atharvadevasthali.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AdminAnalyticsService {

    private static final int TOP_N = 5;

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final UserFavoriteRepository favoriteRepository;
    private final EatingHistoryRepository historyRepository;

    public AdminAnalyticsService(UserRepository userRepository,
                                  RecipeRepository recipeRepository,
                                  UserFavoriteRepository favoriteRepository,
                                  EatingHistoryRepository historyRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.favoriteRepository = favoriteRepository;
        this.historyRepository = historyRepository;
    }

    public AnalyticsDTO getAnalytics() {
        return new AnalyticsDTO(
                userRepository.count(),
                recipeRepository.countByOwnerIsNull(),
                recipeRepository.countByOwnerIsNotNullAndIsPublicTrue(),
                favoriteRepository.count(),
                historyRepository.count(),
                favoriteRepository.findTopFavorited(PageRequest.of(0, TOP_N)),
                historyRepository.findTopCooked(PageRequest.of(0, TOP_N))
        );
    }
}
