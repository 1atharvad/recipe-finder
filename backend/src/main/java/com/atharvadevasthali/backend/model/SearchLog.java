package com.atharvadevasthali.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_logs", indexes = {
        @Index(name = "idx_user_searched", columnList = "user_id,searched_at"),
        @Index(name = "idx_searched_time", columnList = "searched_at")
})
public class SearchLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 500)
    private String query;

    private Integer resultCount;

    private LocalDateTime searchedAt = LocalDateTime.now();

    public SearchLog() {}

    public SearchLog(User user, String query, Integer resultCount) {
        this.user = user;
        this.query = query;
        this.resultCount = resultCount;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getQuery() { return query; }
    public Integer getResultCount() { return resultCount; }
    public LocalDateTime getSearchedAt() { return searchedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setQuery(String query) { this.query = query; }
    public void setResultCount(Integer resultCount) { this.resultCount = resultCount; }
    public void setSearchedAt(LocalDateTime searchedAt) { this.searchedAt = searchedAt; }
}
