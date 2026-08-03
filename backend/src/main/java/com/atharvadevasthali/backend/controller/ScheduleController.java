package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.CreateScheduleRequest;
import com.atharvadevasthali.backend.dto.UpdateScheduleRequest;
import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.MealSchedule;
import com.atharvadevasthali.backend.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public List<MealSchedule> getSchedules(Authentication auth) {
        return scheduleService.getSchedules(auth.getName());
    }

    @PostMapping
    public ResponseEntity<MealSchedule> createSchedule(@Valid @RequestBody CreateScheduleRequest req,
                                                        Authentication auth) {
        MealSchedule schedule = scheduleService.createSchedule(
                auth.getName(), req.getRecipeId(), req.getScheduledAt(), req.getNote());
        return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
    }

    @PutMapping("/{id}")
    public MealSchedule updateSchedule(@PathVariable Long id,
                                        @Valid @RequestBody UpdateScheduleRequest req,
                                        Authentication auth) {
        return scheduleService.updateSchedule(auth.getName(), id, req.getScheduledAt(), req.getNote());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id, Authentication auth) {
        scheduleService.deleteSchedule(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public EatingHistory completeSchedule(@PathVariable Long id, Authentication auth) {
        return scheduleService.completeSchedule(auth.getName(), id);
    }
}
