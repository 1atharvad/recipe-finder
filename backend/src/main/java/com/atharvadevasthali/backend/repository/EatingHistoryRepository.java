package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.dto.RecipeCountDTO;
import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EatingHistoryRepository extends JpaRepository<EatingHistory, Long> {
    List<EatingHistory> findByUserOrderByEatenOnDesc(User user);
    List<EatingHistory> findByUser(User user);
    List<EatingHistory> findByUserAndRecipeOrderByEatenOnDesc(User user, Recipe recipe);
    void deleteByRecipe(Recipe recipe);

    @Query("SELECT new com.atharvadevasthali.backend.dto.RecipeCountDTO(h.recipe.id, h.recipe.name, COUNT(h)) " +
           "FROM EatingHistory h GROUP BY h.recipe.id, h.recipe.name ORDER BY COUNT(h) DESC")
    List<RecipeCountDTO> findTopCooked(Pageable pageable);
}
