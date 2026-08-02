package com.atharvadevasthali.backend.service;

import com.atharvadevasthali.backend.dto.AdminUserDTO;
import com.atharvadevasthali.backend.dto.AuthRequest;
import com.atharvadevasthali.backend.dto.AuthResponse;
import com.atharvadevasthali.backend.dto.ChangePasswordRequest;
import com.atharvadevasthali.backend.dto.LoginRequest;
import com.atharvadevasthali.backend.dto.PreferencesRequest;
import com.atharvadevasthali.backend.dto.SignupRequest;
import com.atharvadevasthali.backend.dto.UpdateProfileRequest;
import com.atharvadevasthali.backend.dto.UserProfileDTO;
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
import java.util.stream.Collectors;

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
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .disabled(!user.isEnabled())
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole())))
                .build();
    }

    public AuthResponse signup(SignupRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(
                generateUniqueUsername(request.getFirstName(), request.getLastName()),
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                "ROLE_USER"
        );
        userRepository.save(user);

        UserPreferences prefs = new UserPreferences(user);
        preferencesRepository.save(prefs);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getFirstName(), user.getLastName(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account has been disabled");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getFirstName(), user.getLastName(), user.getRole());
    }

    public AuthResponse adminLogin(AuthRequest request) {
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }
        String token = jwtUtil.generateToken(adminUsername, "ROLE_ADMIN");
        return new AuthResponse(token, adminUsername, "", "ROLE_ADMIN");
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserProfileDTO getProfile(String username) {
        User user = getByUsername(username);
        return new UserProfileDTO(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());
    }

    public UserProfileDTO updateProfile(String username, UpdateProfileRequest request) {
        User user = getByUsername(username);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        userRepository.save(user);
        return new UserProfileDTO(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail());
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = getByUsername(username);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New passwords do not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
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

    // ── Admin: user management ─────────────────────────────────────────────

    public List<AdminUserDTO> getAllUsersForAdmin() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserDTO(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(),
                        u.getRole(), u.isEnabled(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    // Internal identity only — never surfaced to the user or the API (see User.username's @JsonIgnore).
    // Derived from the name with a numeric suffix appended on collision.
    private String generateUniqueUsername(String firstName, String lastName) {
        String base = (firstName + "." + lastName)
                .toLowerCase()
                .replaceAll("[^a-z0-9.]", "");
        if (base.isBlank()) {
            base = "user";
        }
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }
}
