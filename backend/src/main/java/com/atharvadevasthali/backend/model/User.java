package com.atharvadevasthali.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // System-generated at signup, used internally as the Spring Security/JWT
    // principal — never shown to the user or exposed over the API.
    @JsonIgnore
    @Column(unique = true, nullable = false)
    private String username;

    // Explicit default so Hibernate's schema update can add these NOT NULL
    // columns to an already-populated users table without failing.
    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String firstName;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;

    // No columnDefinition here — Hibernate would keep re-issuing an invalid
    // "ALTER COLUMN ... SET DATA TYPE ... DEFAULT ..." on every boot trying to
    // reconcile it (Postgres doesn't allow a type change and default in the same
    // clause). The DB-level default from the original migration is enough;
    // @PrePersist below guarantees new rows get a value regardless.
    @Column(nullable = false)
    private Instant createdAt;

    // @JsonIgnore breaks a real infinite-recursion bug: User -> preferences ->
    // UserPreferences.user -> back to this same User -> preferences -> ...
    // Nothing needs preferences nested inside a serialized User anyway — the
    // dedicated /api/v1/preferences endpoint returns UserPreferences directly.
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserPreferences preferences;

    public User() {}

    public User(String username, String firstName, String lastName, String email, String password, String role) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public UserPreferences getPreferences() { return preferences; }

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setPreferences(UserPreferences preferences) { this.preferences = preferences; }
}
