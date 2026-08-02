package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.dto.RecipeCountDTO;
import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.model.UserFavorite;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUser(User user);
    Optional<UserFavorite> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    void deleteByUserAndRecipe(User user, Recipe recipe);

    @Query("SELECT new com.atharvadevasthali.backend.dto.RecipeCountDTO(f.recipe.id, f.recipe.name, COUNT(f)) " +
           "FROM UserFavorite f GROUP BY f.recipe.id, f.recipe.name ORDER BY COUNT(f) DESC")
    List<RecipeCountDTO> findTopFavorited(Pageable pageable);
}
