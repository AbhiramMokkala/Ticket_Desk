package com.ticketdesk.service;

import com.ticketdesk.dto.TicketRequests;
import com.ticketdesk.dto.TicketResponses;
import com.ticketdesk.exception.BadRequestException;
import com.ticketdesk.exception.ResourceNotFoundException;
import com.ticketdesk.exception.UnauthorizedException;
import com.ticketdesk.model.*;
import com.ticketdesk.repository.TicketActivityRepository;
import com.ticketdesk.repository.TicketRepository;
import com.ticketdesk.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public TicketService(TicketRepository ticketRepository,
                         TicketActivityRepository activityRepository,
                         UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TicketResponses.TicketDetailResponse createTicket(TicketRequests.CreateTicketRequest request, User creator) {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID());
        ticket.setTicketNumber(generateUniqueTicketNumber());
        ticket.setSubject(request.getSubject().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(creator);

        Ticket savedTicket = ticketRepository.save(ticket);

        TicketActivity activity = new TicketActivity(
                savedTicket,
                "TICKET_CREATED",
                null,
                TicketStatus.OPEN.name(),
                creator
        );
        activityRepository.save(activity);

        return toDetailResponse(savedTicket);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponses.TicketSummaryResponse> getTickets(
            User currentUser,
            TicketStatus status,
            TicketPriority priority,
            String searchTerm,
            Pageable pageable) {

        User filterUser = (currentUser.getRole() == Role.EMPLOYEE) ? currentUser : null;
        String searchPattern = (searchTerm != null && !searchTerm.trim().isEmpty())
                ? "%" + searchTerm.trim().toLowerCase() + "%"
                : null;

        Page<Ticket> ticketPage = ticketRepository.searchTickets(filterUser, status, priority, searchPattern, pageable);
        return ticketPage.map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public TicketResponses.TicketDetailResponse getTicketById(UUID id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Employee can only view their own tickets
        if (currentUser.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this ticket");
        }

        return toDetailResponse(ticket);
    }

    @Transactional
    public TicketResponses.TicketDetailResponse updateTicketStatus(UUID id, TicketStatus newStatus, User actor) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Employees cannot modify ticket status
        if (actor.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees are not authorized to modify ticket status");
        }

        TicketStatus oldStatus = ticket.getStatus();
        if (oldStatus == newStatus) {
            return toDetailResponse(ticket);
        }

        ticket.setStatus(newStatus);
        Ticket updatedTicket = ticketRepository.save(ticket);

        TicketActivity activity = new TicketActivity(
                updatedTicket,
                "STATUS_UPDATED",
                oldStatus.name(),
                newStatus.name(),
                actor
        );
        activityRepository.save(activity);

        return toDetailResponse(updatedTicket);
    }

    @Transactional
    public TicketResponses.TicketDetailResponse assignTicket(UUID id, UUID agentId, User actor) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (actor.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot assign tickets");
        }

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

        if (agent.getRole() == Role.EMPLOYEE) {
            throw new BadRequestException("Tickets cannot be assigned to an Employee account");
        }

        String oldAgentName = (ticket.getAssignedTo() != null) ? ticket.getAssignedTo().getFullName() : "Unassigned";
        ticket.setAssignedTo(agent);

        // If status was OPEN, assigning automatically moves it to IN_PROGRESS
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            TicketActivity statusActivity = new TicketActivity(
                    ticket,
                    "STATUS_UPDATED",
                    TicketStatus.OPEN.name(),
                    TicketStatus.IN_PROGRESS.name(),
                    actor
            );
            activityRepository.save(statusActivity);
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        TicketActivity assignActivity = new TicketActivity(
                updatedTicket,
                "TICKET_ASSIGNED",
                oldAgentName,
                agent.getFullName(),
                actor
        );
        activityRepository.save(assignActivity);

        return toDetailResponse(updatedTicket);
    }

    private synchronized String generateUniqueTicketNumber() {
        for (int i = 0; i < 10; i++) {
            long count = ticketRepository.countTotalTickets() + 1 + i;
            String candidate = String.format("TKT-%06d", count);
            if (ticketRepository.findByTicketNumber(candidate).isEmpty()) {
                return candidate;
            }
        }
        return "TKT-" + (100000 + random.nextInt(900000));
    }

    public TicketResponses.TicketSummaryResponse toSummaryResponse(Ticket ticket) {
        return new TicketResponses.TicketSummaryResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getSubject(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getCreatedBy().getId(),
                ticket.getCreatedBy().getFullName(),
                (ticket.getAssignedTo() != null) ? ticket.getAssignedTo().getId() : null,
                (ticket.getAssignedTo() != null) ? ticket.getAssignedTo().getFullName() : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    public TicketResponses.TicketDetailResponse toDetailResponse(Ticket ticket) {
        TicketResponses.TicketDetailResponse response = new TicketResponses.TicketDetailResponse();
        response.setId(ticket.getId());
        response.setTicketNumber(ticket.getTicketNumber());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedById(ticket.getCreatedBy().getId());
        response.setCreatedByName(ticket.getCreatedBy().getFullName());
        response.setCreatedByEmail(ticket.getCreatedBy().getEmail());
        response.setAssignedToId((ticket.getAssignedTo() != null) ? ticket.getAssignedTo().getId() : null);
        response.setAssignedToName((ticket.getAssignedTo() != null) ? ticket.getAssignedTo().getFullName() : null);
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());

        List<TicketActivity> activities = activityRepository.findByTicketOrderByCreatedAtDesc(ticket);
        List<TicketResponses.ActivityItemResponse> activityDtos = activities.stream()
                .map(a -> new TicketResponses.ActivityItemResponse(
                        a.getId(),
                        a.getAction(),
                        a.getOldValue(),
                        a.getNewValue(),
                        a.getPerformedBy().getFullName(),
                        a.getCreatedAt()
                ))
                .collect(Collectors.toList());
        response.setActivities(activityDtos);

        return response;
    }
}

