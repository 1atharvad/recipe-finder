package com.atharvadevasthali.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${allowed.origins}")
    private List<String> allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Without this, Spring's default fallback (Http403ForbiddenEntryPoint) sends
                // 403 for a missing/invalid/expired JWT — indistinguishable from a genuine
                // AccessDeniedException (wrong role, "not your recipe", etc). The frontend
                // needs 401 to mean "not authenticated, redirect to login" specifically, so it
                // never confuses an expired session with a real permission error.
                .exceptionHandling(ex -> ex.authenticationEntryPoint(
                        (request, response, authException) -> response.sendError(401)))
                .authorizeHttpRequests(auth -> auth
                        // Spring's error handling does an internal forward to /error (e.g. for any
                        // ResponseStatusException), which otherwise gets caught by anyRequest().authenticated()
                        // below and masks every error status (401/404/409/...) as a generic 403.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/recipes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/recipes/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/recipes/{id}").permitAll()
                        // recipe-views and searches are tracked for anonymous visitors too, so
                        // they must be reachable without a JWT; ai-chats tracking stays behind
                        // anyRequest().authenticated() below since AI chat itself requires login.
                        .requestMatchers(HttpMethod.POST, "/api/v1/events/recipe-views", "/api/v1/events/searches").permitAll()
                        // smart-search and chat call the paid Gemini API — require login so
                        // premiumAccess can be checked (see RecipeController), unlike the
                        // other endpoints above which are free and open to anyone.
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
