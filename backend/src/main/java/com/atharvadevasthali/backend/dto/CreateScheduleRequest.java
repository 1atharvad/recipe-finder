package com.atharvadevasthali.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateScheduleRequest {
    @NotNull
    private Long recipeId;

    @NotNull
    private LocalDateTime scheduledAt;

    private String note;

    public Long getRecipeId() { return recipeId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getNote() { return note; }

    public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public void setNote(String note) { this.note = note; }
}
