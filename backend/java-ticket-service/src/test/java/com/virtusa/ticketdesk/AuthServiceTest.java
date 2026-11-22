package com.virtusa.ticketdesk;

import com.virtusa.ticketdesk.dto.AuthRequests;
import com.virtusa.ticketdesk.dto.AuthResponses;
import com.virtusa.ticketdesk.exception.BadRequestException;
import com.virtusa.ticketdesk.exception.UnauthorizedException;
import com.virtusa.ticketdesk.model.Role;
import com.virtusa.ticketdesk.model.User;
import com.virtusa.ticketdesk.repository.UserRepository;
import com.virtusa.ticketdesk.security.JwtTokenProvider;
import com.virtusa.ticketdesk.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtTokenProvider, 24);
    }

    @Test
    @DisplayName("Register should successfully create employee and return JWT")
    void register_Success() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest(
                "Alice Smith", "alice@test.com", "Password@123"
        );

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return u;
        });
        when(jwtTokenProvider.generateToken(any(User.class))).thenReturn("jwt-token-123");

        AuthResponses.AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token-123", response.getToken());
        assertEquals("alice@test.com", response.getEmail());
        assertEquals(Role.EMPLOYEE, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Register should reject duplicate email")
    void register_DuplicateEmail_ThrowsException() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest(
                "Alice Smith", "alice@test.com", "Password@123"
        );

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login should succeed with valid credentials")
    void login_Success() {
        User user = new User(UUID.randomUUID(), "Alice Smith", "alice@test.com", "hashedPassword", Role.EMPLOYEE);
        AuthRequests.LoginRequest request = new AuthRequests.LoginRequest("alice@test.com", "Password@123");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateToken(user)).thenReturn("valid-jwt-token");

        AuthResponses.AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid-jwt-token", response.getToken());
        assertEquals(Role.EMPLOYEE, response.getRole());
    }

    @Test
    @DisplayName("Login should fail with invalid password")
    void login_InvalidPassword_ThrowsException() {
        User user = new User(UUID.randomUUID(), "Alice Smith", "alice@test.com", "hashedPassword", Role.EMPLOYEE);
        AuthRequests.LoginRequest request = new AuthRequests.LoginRequest("alice@test.com", "WrongPassword");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
