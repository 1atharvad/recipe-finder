package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.model.Ingredient;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.repository.RecipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Owns the recipe_embeddings vector index: turning a recipe into embeddable
 * text, keeping its embedding in sync with edits, and running similarity
 * search for RAG-style smart search.
 *
 * Only recipes in the general/public pool (owner IS NULL OR isPublic) are
 * indexed — private recipes are never embedded or searchable this way.
 */
@Service
public class RecipeEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(RecipeEmbeddingService.class);

    private final JdbcTemplate jdbcTemplate;
    private final RecipeRepository recipeRepository;
    private final GeminiClient geminiClient;

    public RecipeEmbeddingService(JdbcTemplate jdbcTemplate,
                                   RecipeRepository recipeRepository,
                                   GeminiClient geminiClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.recipeRepository = recipeRepository;
        this.geminiClient = geminiClient;
    }

    public String buildEmbeddingText(Recipe recipe) {
        String ingredients = recipe.getIngredients() == null ? "" : recipe.getIngredients().stream()
                .map(Ingredient::getName)
                .collect(Collectors.joining(", "));
        String steps = recipe.getSteps() == null ? "" : String.join(" ", recipe.getSteps());

        return "Recipe: " + recipe.getName()
                + ". Ingredients: " + ingredients
                + (recipe.getDietaryType() != null ? ". Dietary: " + recipe.getDietaryType() : "")
                + (recipe.getCuisineType() != null ? ". Cuisine: " + recipe.getCuisineType() : "")
                + ". Steps: " + steps;
    }

    /** Re-embeds a recipe. Safe to call for any recipe; callers decide whether it should be indexed. */
    public void upsertEmbedding(Recipe recipe) {
        if (!geminiClient.isConfigured()) return;
        try {
            float[] vector = geminiClient.embed(buildEmbeddingText(recipe));
            jdbcTemplate.update(
                "INSERT INTO recipe_embeddings (recipe_id, embedding) VALUES (?, ?::vector) " +
                "ON CONFLICT (recipe_id) DO UPDATE SET embedding = EXCLUDED.embedding",
                recipe.getId(), toVectorLiteral(vector)
            );
        } catch (Exception e) {
            // Embedding is a best-effort enhancement — never let it break a recipe save.
            log.warn("Failed to embed recipe {}: {}", recipe.getId(), e.getMessage());
        }
    }

    public void deleteEmbedding(Long recipeId) {
        jdbcTemplate.update("DELETE FROM recipe_embeddings WHERE recipe_id = ?", recipeId);
    }

    /** Embeds any general/public recipe that doesn't have an embedding yet (startup backfill). */
    @Transactional
    public void backfillMissingEmbeddings() {
        if (!geminiClient.isConfigured()) return;
        List<Long> alreadyEmbedded = jdbcTemplate.queryForList("SELECT recipe_id FROM recipe_embeddings", Long.class);
        recipeRepository.findByOwnerIsNullOrIsPublicTrue(org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .filter(r -> !alreadyEmbedded.contains(r.getId()))
                .forEach(this::upsertEmbedding);
    }

    /** Returns recipe IDs from the general/public pool, ranked by similarity to the query, most similar first. */
    public List<Long> similaritySearch(String query, int limit) {
        if (!geminiClient.isConfigured()) return List.of();
        float[] queryVector = geminiClient.embed(query);
        return jdbcTemplate.queryForList(
            "SELECT re.recipe_id FROM recipe_embeddings re " +
            "JOIN recipes r ON r.id = re.recipe_id " +
            "WHERE r.owner_id IS NULL OR r.is_public = true " +
            "ORDER BY re.embedding <=> ?::vector LIMIT ?",
            Long.class, toVectorLiteral(queryVector), limit
        );
    }

    private String toVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vector[i]);
        }
        return sb.append(']').toString();
    }
}
