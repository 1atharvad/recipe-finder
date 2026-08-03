package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN r.ingredients i " +
           "WHERE (r.owner IS NULL OR r.isPublic = true) AND (" +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Recipe> searchGeneralByNameOrIngredient(@Param("q") String q);

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN r.ingredients i " +
           "WHERE (r.owner IS NULL OR r.isPublic = true OR r.owner = :user) AND (" +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(i.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Recipe> searchByNameOrIngredientForUser(@Param("q") String q, @Param("user") User user);

    List<Recipe> findByOwner(User owner);

    // General pool for browsing/top-recipes: admin-curated (owner IS NULL)
    // plus any user recipe its owner has opted to make public.
    Page<Recipe> findByOwnerIsNullOrIsPublicTrue(Pageable pageable);

    // "Top recipes" ranked by actual popularity — favorites + times cooked —
    // rather than arbitrary DB order. r.id ASC is just a stable tiebreaker
    // for recipes tied on score (e.g. everything at 0 on a fresh install).
    @Query("SELECT r FROM Recipe r WHERE r.owner IS NULL OR r.isPublic = true " +
           "ORDER BY (" +
           "  (SELECT COUNT(f) FROM UserFavorite f WHERE f.recipe = r) + " +
           "  (SELECT COUNT(h) FROM EatingHistory h WHERE h.recipe = r)" +
           ") DESC, r.id ASC")
    Page<Recipe> findTopGeneralByScore(Pageable pageable);

    // Admin's own CRUD scope stays strictly the curated pool — public user
    // recipes are not admin-editable.
    List<Recipe> findByOwnerIsNull();

    long countByOwnerIsNull();

    // Admin moderation scope: user-owned recipes the owner has made public.
    List<Recipe> findByOwnerIsNotNullAndIsPublicTrue();

    long countByOwnerIsNotNullAndIsPublicTrue();
}
