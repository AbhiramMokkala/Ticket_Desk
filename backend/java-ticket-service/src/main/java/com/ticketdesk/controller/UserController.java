package com.ticketdesk.controller;

import com.ticketdesk.dto.ApiResponse;
import com.ticketdesk.dto.UserManagementDto;
import com.ticketdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserManagementDto.UserSummaryResponse>>> getAllUsers() {
        List<UserManagementDto.UserSummaryResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserManagementDto.UserStatsResponse>> getUserStats() {
        UserManagementDto.UserStatsResponse stats = userService.getUserStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserManagementDto.UserSummaryResponse>> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UserManagementDto.UpdateRoleRequest request) {
        UserManagementDto.UserSummaryResponse updated = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", updated));
    }
}

