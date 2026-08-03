package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.MealSchedule;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.repository.EatingHistoryRepository;
import com.atharvadevasthali.backend.repository.MealScheduleRepository;
import com.atharvadevasthali.backend.repository.RecipeRepository;
import com.atharvadevasthali.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleService {

    private final MealScheduleRepository scheduleRepository;
    private final EatingHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    public ScheduleService(MealScheduleRepository scheduleRepository,
                            EatingHistoryRepository historyRepository,
                            UserRepository userRepository,
                            RecipeRepository recipeRepository) {
        this.scheduleRepository = scheduleRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
    }

    public List<MealSchedule> getSchedules(String username) {
        return scheduleRepository.findByUserOrderByScheduledAtAsc(getUser(username));
    }

    public MealSchedule createSchedule(String username, Long recipeId, LocalDateTime scheduledAt, String note) {
        User user = getUser(username);
        Recipe recipe = getRecipe(recipeId);
        return scheduleRepository.save(new MealSchedule(user, recipe, scheduledAt, note));
    }

    public MealSchedule updateSchedule(String username, Long scheduleId, LocalDateTime scheduledAt, String note) {
        MealSchedule schedule = getOwnedSchedule(username, scheduleId);
        schedule.setScheduledAt(scheduledAt);
        schedule.setNote(note);
        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(String username, Long scheduleId) {
        scheduleRepository.delete(getOwnedSchedule(username, scheduleId));
    }

    // Marking a schedule done also logs it as eaten, same as the "Mark as
    // Eaten" button on a recipe page — a completed schedule is a real meal.
    public EatingHistory completeSchedule(String username, Long scheduleId) {
        MealSchedule schedule = getOwnedSchedule(username, scheduleId);
        schedule.setCompleted(true);
        scheduleRepository.save(schedule);

        LocalDateTime now = LocalDateTime.now();
        EatingHistory entry = new EatingHistory(schedule.getUser(), schedule.getRecipe(), now.toLocalDate());
        entry.setRecordedAt(now);
        return historyRepository.save(entry);
    }

    private MealSchedule getOwnedSchedule(String username, Long scheduleId) {
        User user = getUser(username);
        MealSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Schedule not found"));
        if (!schedule.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your schedule");
        }
        return schedule;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Recipe getRecipe(Long recipeId) {
        return recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
    }
}
