package com.ticketdesk.controller;

import com.ticketdesk.dto.ApiResponse;
import com.ticketdesk.dto.AuthRequests;
import com.ticketdesk.dto.AuthResponses;
import com.ticketdesk.security.CustomUserPrincipal;
import com.ticketdesk.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponses.AuthResponse>> register(
            @Valid @RequestBody AuthRequests.RegisterRequest request) {
        AuthResponses.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponses.AuthResponse>> login(
            @Valid @RequestBody AuthRequests.LoginRequest request) {
        AuthResponses.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponses.UserProfileResponse>> getProfile(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        AuthResponses.UserProfileResponse profile = authService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}

