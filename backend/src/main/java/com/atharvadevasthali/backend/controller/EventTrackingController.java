package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.AiChatAcceptRequest;
import com.atharvadevasthali.backend.dto.TrackAiChatRequest;
import com.atharvadevasthali.backend.dto.TrackAiChatResponse;
import com.atharvadevasthali.backend.dto.TrackRecipeViewRequest;
import com.atharvadevasthali.backend.dto.TrackSearchRequest;
import com.atharvadevasthali.backend.model.AiChatLog;
import com.atharvadevasthali.backend.model.RecipeView;
import com.atharvadevasthali.backend.model.SearchLog;
import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.repository.AiChatLogRepository;
import com.atharvadevasthali.backend.repository.RecipeViewRepository;
import com.atharvadevasthali.backend.repository.SearchLogRepository;
import com.atharvadevasthali.backend.service.RecipeService;
import com.atharvadevasthali.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/events")
public class EventTrackingController {

    private final RecipeViewRepository viewRepo;
    private final SearchLogRepository searchRepo;
    private final AiChatLogRepository aiRepo;
    private final UserService userService;
    private final RecipeService recipeService;

    public EventTrackingController(RecipeViewRepository viewRepo,
                                    SearchLogRepository searchRepo,
                                    AiChatLogRepository aiRepo,
                                    UserService userService,
                                    RecipeService recipeService) {
        this.viewRepo = viewRepo;
        this.searchRepo = searchRepo;
        this.aiRepo = aiRepo;
        this.userService = userService;
        this.recipeService = recipeService;
    }

    // recipe-views and searches are tracked for anonymous visitors too, so the
    // user is resolved only when a valid JWT is present (see SecurityConfig).
    private User resolveOptionalUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return userService.getByUsername(auth.getName());
    }

    @PostMapping("/recipe-views")
    public ResponseEntity<Void> trackRecipeView(@RequestBody TrackRecipeViewRequest req, Authentication auth) {
        RecipeView view = new RecipeView(resolveOptionalUser(auth), recipeService.getById(req.getRecipeId()));
        viewRepo.save(view);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/searches")
    public ResponseEntity<Void> trackSearch(@RequestBody TrackSearchRequest req, Authentication auth) {
        SearchLog log = new SearchLog(resolveOptionalUser(auth), req.getQuery(), req.getResultCount());
        searchRepo.save(log);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // AI chat is a premium/authenticated-only feature, so SecurityConfig requires
    // a valid JWT here already — auth.getName() is always safe to call.
    @PostMapping("/ai-chats")
    public ResponseEntity<TrackAiChatResponse> trackAiChat(@RequestBody TrackAiChatRequest req, Authentication auth) {
        User user = userService.getByUsername(auth.getName());
        String recipeIds = req.getRecommendedRecipeIds() == null ? "" :
                req.getRecommendedRecipeIds().stream().map(String::valueOf).collect(Collectors.joining(","));
        AiChatLog log = new AiChatLog(user, req.getQuery(), recipeIds);
        AiChatLog saved = aiRepo.save(log);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TrackAiChatResponse(saved.getId()));
    }

    @PutMapping("/ai-chats/{logId}/accept")
    public ResponseEntity<Void> trackAiAcceptance(@PathVariable Long logId,
                                                   @RequestBody AiChatAcceptRequest req,
                                                   Authentication auth) {
        AiChatLog log = aiRepo.findById(logId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "AI chat log not found"));
        if (!log.getUser().getUsername().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your AI chat log");
        }
        log.setUserAccepted(true);
        log.setAcceptedRecipe(recipeService.getById(req.getAcceptedRecipeId()));
        aiRepo.save(log);
        return ResponseEntity.ok().build();
    }
}
