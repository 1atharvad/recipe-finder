package com.atharvadevasthali.backend.dto;

import java.time.LocalDateTime;

// Optional body for POST /history/{recipeId} — lets the user backdate/adjust
// when they actually ate the recipe instead of always using the request time.
public class MarkEatenRequest {
    private LocalDateTime eatenAt;

    public LocalDateTime getEatenAt() { return eatenAt; }
    public void setEatenAt(LocalDateTime eatenAt) { this.eatenAt = eatenAt; }
}
