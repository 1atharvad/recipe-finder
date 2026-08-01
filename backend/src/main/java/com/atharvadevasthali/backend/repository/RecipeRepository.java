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

    // Admin's own CRUD scope stays strictly the curated pool — public user
    // recipes are not admin-editable.
    List<Recipe> findByOwnerIsNull();
}
