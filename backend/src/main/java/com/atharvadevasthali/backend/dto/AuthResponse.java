package com.atharvadevasthali.backend.dto;

public class AuthResponse {

    private String token;
    private String firstName;
    private String lastName;
    private String role;

    public AuthResponse(String token, String firstName, String lastName, String role) {
        this.token = token;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getRole() { return role; }
}
