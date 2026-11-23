package com.ticketdesk.controller;

import com.ticketdesk.dto.ApiResponse;
import com.ticketdesk.dto.TicketResponses;
import com.ticketdesk.model.User;
import com.ticketdesk.repository.UserRepository;
import com.ticketdesk.security.CustomUserPrincipal;
import com.ticketdesk.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TicketResponses.DashboardStatsResponse>> getStats(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.ticketdesk.exception.ResourceNotFoundException("User not found"));
        TicketResponses.DashboardStatsResponse stats = dashboardService.getDashboardStats(currentUser);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}

