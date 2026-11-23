package com.ticketdesk.controller;

import com.ticketdesk.dto.InternalAuthResponse;
import com.ticketdesk.model.Role;
import com.ticketdesk.model.Ticket;
import com.ticketdesk.model.User;
import com.ticketdesk.repository.TicketRepository;
import com.ticketdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/internal/tickets")
public class InternalTicketController {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final String internalSecretKey;

    public InternalTicketController(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            @Value("${app.internal.secret-key:TicketDeskInternalServiceAuthSecret2026!}") String internalSecretKey) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.internalSecretKey = internalSecretKey;
    }

    @GetMapping("/{id}/verify-access")
    public ResponseEntity<InternalAuthResponse> verifyTicketAccess(
            @PathVariable UUID id,
            @RequestParam UUID userId,
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey) {

        // Validate internal microservice authentication
        if (serviceKey == null || !serviceKey.equals(internalSecretKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new InternalAuthResponse(id, false, null, false, false, "Invalid internal service credentials"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InternalAuthResponse(id, false, null, false, false, "User not found"));
        }
        User user = userOpt.get();

        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new InternalAuthResponse(id, false, user.getRole(), false, false, "Ticket not found"));
        }
        Ticket ticket = ticketOpt.get();

        boolean isOwner = ticket.getCreatedBy().getId().equals(user.getId());
        boolean isAssigned = (ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId()));

        boolean canAccess = false;
        String reason = "Access granted";

        if (user.getRole() == Role.ADMINISTRATOR || user.getRole() == Role.SUPPORT_AGENT) {
            canAccess = true;
        } else if (user.getRole() == Role.EMPLOYEE) {
            canAccess = isOwner;
            if (!canAccess) {
                reason = "Employees are only permitted to access tickets they authored";
            }
        }

        return ResponseEntity.ok(new InternalAuthResponse(
                id,
                canAccess,
                user.getRole(),
                isOwner,
                isAssigned,
                reason
        ));
    }
}

