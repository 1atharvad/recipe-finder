package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.AiChatLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatLogRepository extends JpaRepository<AiChatLog, Long> {
    long countByUserAcceptedTrue();
}
