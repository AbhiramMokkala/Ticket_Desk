package com.virtusa.ticketdesk.controller;

import com.virtusa.ticketdesk.dto.ApiResponse;
import com.virtusa.ticketdesk.dto.TicketRequests;
import com.virtusa.ticketdesk.dto.TicketResponses;
import com.virtusa.ticketdesk.model.TicketPriority;
import com.virtusa.ticketdesk.model.TicketStatus;
import com.virtusa.ticketdesk.model.User;
import com.virtusa.ticketdesk.repository.UserRepository;
import com.virtusa.ticketdesk.security.CustomUserPrincipal;
import com.virtusa.ticketdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponses.TicketDetailResponse>> createTicket(
            @Valid @RequestBody TicketRequests.CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        User creator = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.virtusa.ticketdesk.exception.ResourceNotFoundException("User not found"));
        TicketResponses.TicketDetailResponse response = ticketService.createTicket(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ticket created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TicketResponses.TicketSummaryResponse>>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.virtusa.ticketdesk.exception.ResourceNotFoundException("User not found"));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TicketResponses.TicketSummaryResponse> tickets =
                ticketService.getTickets(currentUser, status, priority, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponses.TicketDetailResponse>> getTicketById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.virtusa.ticketdesk.exception.ResourceNotFoundException("User not found"));
        TicketResponses.TicketDetailResponse ticket = ticketService.getTicketById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(ticket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponses.TicketDetailResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TicketRequests.UpdateStatusRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        User actor = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.virtusa.ticketdesk.exception.ResourceNotFoundException("User not found"));
        TicketResponses.TicketDetailResponse ticket = ticketService.updateTicketStatus(id, request.getStatus(), actor);
        return ResponseEntity.ok(ApiResponse.ok("Ticket status updated", ticket));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponses.TicketDetailResponse>> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody TicketRequests.AssignTicketRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        User actor = userRepository.findById(principal.getId())
                .orElseThrow(() -> new com.virtusa.ticketdesk.exception.ResourceNotFoundException("User not found"));
        TicketResponses.TicketDetailResponse ticket = ticketService.assignTicket(id, request.getAgentId(), actor);
        return ResponseEntity.ok(ApiResponse.ok("Ticket assigned successfully", ticket));
    }
}
