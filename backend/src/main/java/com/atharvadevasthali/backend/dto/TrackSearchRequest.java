package com.atharvadevasthali.backend.dto;

public class TrackSearchRequest {
    private String query;
    private Integer resultCount;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Integer getResultCount() { return resultCount; }
    public void setResultCount(Integer resultCount) { this.resultCount = resultCount; }
}
