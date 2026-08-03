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
    // JOIN FETCH so `.getRecipe()` returns an initialized entity, not a lazy
    // proxy — Jackson can't serialize an uninitialized Hibernate proxy
    // directly (it tries to serialize the proxy's own internal fields).
    @Query("SELECT f FROM UserFavorite f JOIN FETCH f.recipe WHERE f.user = :user ORDER BY f.savedAt DESC")
    List<UserFavorite> findByUser(User user);
    Optional<UserFavorite> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    void deleteByUserAndRecipe(User user, Recipe recipe);
    void deleteByRecipe(Recipe recipe);

    @Query("SELECT new com.atharvadevasthali.backend.dto.RecipeCountDTO(f.recipe.id, f.recipe.name, COUNT(f)) " +
           "FROM UserFavorite f GROUP BY f.recipe.id, f.recipe.name ORDER BY COUNT(f) DESC")
    List<RecipeCountDTO> findTopFavorited(Pageable pageable);
}
