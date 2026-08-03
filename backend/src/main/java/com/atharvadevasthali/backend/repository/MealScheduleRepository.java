package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.MealSchedule;
import com.atharvadevasthali.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealScheduleRepository extends JpaRepository<MealSchedule, Long> {
    List<MealSchedule> findByUserOrderByScheduledAtAsc(User user);
}
