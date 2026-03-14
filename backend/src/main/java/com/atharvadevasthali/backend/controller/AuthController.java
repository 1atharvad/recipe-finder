package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.AuthRequest;
import com.atharvadevasthali.backend.dto.AuthResponse;
import com.atharvadevasthali.backend.dto.SignupRequest;
import com.atharvadevasthali.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(201).body(userService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.adminLogin(request));
    }
}
