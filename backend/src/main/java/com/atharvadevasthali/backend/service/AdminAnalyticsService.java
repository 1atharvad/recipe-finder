package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.AnalyticsDTO;
import com.atharvadevasthali.backend.repository.AiChatLogRepository;
import com.atharvadevasthali.backend.repository.EatingHistoryRepository;
import com.atharvadevasthali.backend.repository.RecipeRepository;
import com.atharvadevasthali.backend.repository.RecipeViewRepository;
import com.atharvadevasthali.backend.repository.SearchLogRepository;
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
    private final RecipeViewRepository viewRepository;
    private final SearchLogRepository searchRepository;
    private final AiChatLogRepository aiChatRepository;

    public AdminAnalyticsService(UserRepository userRepository,
                                  RecipeRepository recipeRepository,
                                  UserFavoriteRepository favoriteRepository,
                                  EatingHistoryRepository historyRepository,
                                  RecipeViewRepository viewRepository,
                                  SearchLogRepository searchRepository,
                                  AiChatLogRepository aiChatRepository) {
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
        this.favoriteRepository = favoriteRepository;
        this.historyRepository = historyRepository;
        this.viewRepository = viewRepository;
        this.searchRepository = searchRepository;
        this.aiChatRepository = aiChatRepository;
    }

    public AnalyticsDTO getAnalytics() {
        long totalAiChats = aiChatRepository.count();
        Double aiAcceptanceRate = totalAiChats == 0 ? null :
                (aiChatRepository.countByUserAcceptedTrue() * 100.0) / totalAiChats;

        return new AnalyticsDTO(
                userRepository.count(),
                recipeRepository.countByOwnerIsNull(),
                recipeRepository.countByOwnerIsNotNullAndIsPublicTrue(),
                favoriteRepository.count(),
                historyRepository.count(),
                viewRepository.count(),
                searchRepository.count(),
                totalAiChats,
                aiAcceptanceRate,
                favoriteRepository.findTopFavorited(PageRequest.of(0, TOP_N)),
                historyRepository.findTopCooked(PageRequest.of(0, TOP_N))
        );
    }
}
