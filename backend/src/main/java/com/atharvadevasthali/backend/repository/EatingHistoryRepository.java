package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.EatingHistory;
import com.atharvadevasthali.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EatingHistoryRepository extends JpaRepository<EatingHistory, Long> {
    List<EatingHistory> findByUserOrderByEatenOnDesc(User user);
    List<EatingHistory> findByUser(User user);
}
