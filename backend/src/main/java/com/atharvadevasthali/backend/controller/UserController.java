package com.atharvadevasthali.backend.controller;

import com.atharvadevasthali.backend.dto.ChangePasswordRequest;
import com.atharvadevasthali.backend.dto.UpdateProfileRequest;
import com.atharvadevasthali.backend.dto.UserProfileDTO;
import com.atharvadevasthali.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileDTO getProfile(Authentication auth) {
        return userService.getProfile(auth.getName());
    }

    @PutMapping("/me")
    public UserProfileDTO updateProfile(@Valid @RequestBody UpdateProfileRequest request, Authentication auth) {
        return userService.updateProfile(auth.getName(), request);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication auth) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
