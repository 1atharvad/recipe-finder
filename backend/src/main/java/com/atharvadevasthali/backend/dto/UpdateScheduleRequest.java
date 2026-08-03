package com.atharvadevasthali.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class UpdateScheduleRequest {
    @NotNull
    private LocalDateTime scheduledAt;

    private String note;

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getNote() { return note; }

    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public void setNote(String note) { this.note = note; }
}
