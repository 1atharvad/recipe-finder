package com.atharvadevasthali.backend.repository;

import com.atharvadevasthali.backend.model.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
}
