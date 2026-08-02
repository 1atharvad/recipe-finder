package com.atharvadevasthali.backend.dto;

import java.util.List;

public class EmbeddingStatusDTO {
    private boolean geminiConfigured;
    private long totalIndexable;
    private long totalEmbedded;
    private List<RecipeRefDTO> missing;

    public EmbeddingStatusDTO(boolean geminiConfigured, long totalIndexable, long totalEmbedded,
                               List<RecipeRefDTO> missing) {
        this.geminiConfigured = geminiConfigured;
        this.totalIndexable = totalIndexable;
        this.totalEmbedded = totalEmbedded;
        this.missing = missing;
    }

    public boolean isGeminiConfigured() { return geminiConfigured; }
    public long getTotalIndexable() { return totalIndexable; }
    public long getTotalEmbedded() { return totalEmbedded; }
    public List<RecipeRefDTO> getMissing() { return missing; }
}
