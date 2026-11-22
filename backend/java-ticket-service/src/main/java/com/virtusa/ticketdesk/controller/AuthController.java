package com.virtusa.ticketdesk.controller;

import com.virtusa.ticketdesk.dto.ApiResponse;
import com.virtusa.ticketdesk.dto.AuthRequests;
import com.virtusa.ticketdesk.dto.AuthResponses;
import com.virtusa.ticketdesk.security.CustomUserPrincipal;
import com.virtusa.ticketdesk.service.AuthService;
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
