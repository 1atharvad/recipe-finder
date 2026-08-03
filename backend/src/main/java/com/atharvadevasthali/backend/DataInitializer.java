package com.atharvadevasthali.backend;

import com.atharvadevasthali.backend.service.RecipeEmbeddingService;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final JdbcTemplate jdbcTemplate;
    private final RecipeEmbeddingService embeddingService;

    public DataInitializer(JdbcTemplate jdbcTemplate, RecipeEmbeddingService embeddingService) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingService = embeddingService;
    }

    // The public recipe catalog lives directly in the database (seeded once,
    // managed via the admin panel) — this class only sets up the vector store
    // and keeps embeddings in sync with whatever's actually in the recipes table.
    @PostConstruct
    public void loadData() {
        setupVectorStore();
        embeddingService.backfillMissingEmbeddings();
    }

    // pgvector is Postgres-specific; skip quietly on other databases (e.g. H2 in tests)
    // so the vector index remains an optional enhancement rather than a hard boot dependency.
    private void setupVectorStore() {
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS recipe_embeddings (" +
                "  recipe_id BIGINT PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE," +
                "  embedding vector(768) NOT NULL" +
                ")"
            );
        } catch (DataAccessException e) {
            // Not running on Postgres/pgvector — smart search/chat stay disabled.
        }
    }
}
