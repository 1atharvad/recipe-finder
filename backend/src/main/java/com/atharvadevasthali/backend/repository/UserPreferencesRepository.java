package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.model.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findByUser(User user);
}
