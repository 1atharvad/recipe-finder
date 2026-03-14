package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.AuthRequest;
import com.atharvadevasthali.backend.dto.AuthResponse;
import com.atharvadevasthali.backend.dto.PreferencesRequest;
import com.atharvadevasthali.backend.dto.SignupRequest;
import com.atharvadevasthali.backend.model.User;
import com.atharvadevasthali.backend.model.UserPreferences;
import com.atharvadevasthali.backend.repository.UserPreferencesRepository;
import com.atharvadevasthali.backend.repository.UserRepository;
import com.atharvadevasthali.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    public UserService(UserRepository userRepository,
                       UserPreferencesRepository preferencesRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.preferencesRepository = preferencesRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole()))
        );
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                "ROLE_USER"
        );
        userRepository.save(user);

        UserPreferences prefs = new UserPreferences(user);
        preferencesRepository.save(prefs);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole());
    }

    public AuthResponse adminLogin(AuthRequest request) {
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }
        String token = jwtUtil.generateToken(adminUsername, "ROLE_ADMIN");
        return new AuthResponse(token, adminUsername, "ROLE_ADMIN");
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserPreferences getPreferences(String username) {
        User user = getByUsername(username);
        return preferencesRepository.findByUser(user)
                .orElseGet(() -> {
                    UserPreferences prefs = new UserPreferences(user);
                    return preferencesRepository.save(prefs);
                });
    }

    public UserPreferences savePreferences(String username, PreferencesRequest request) {
        User user = getByUsername(username);
        UserPreferences prefs = preferencesRepository.findByUser(user)
                .orElseGet(() -> new UserPreferences(user));
        prefs.setDietaryType(request.getDietaryType());
        prefs.setCuisineType(request.getCuisineType());
        return preferencesRepository.save(prefs);
    }
}
