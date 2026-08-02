package com.atharvadevasthali.backend.dto;

import java.time.Instant;

public class AdminUserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean enabled;
    private Instant createdAt;

    public AdminUserDTO(Long id, String firstName, String lastName, String email,
                         String role, boolean enabled, Instant createdAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
}
