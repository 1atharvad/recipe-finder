package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.Recipe;
import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.model.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUser(User user);
    Optional<UserFavorite> findByUserAndRecipe(User user, Recipe recipe);
    boolean existsByUserAndRecipe(User user, Recipe recipe);
    void deleteByUserAndRecipe(User user, Recipe recipe);
}
