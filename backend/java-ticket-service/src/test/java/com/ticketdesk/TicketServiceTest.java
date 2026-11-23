package com.ticketdesk;

import com.ticketdesk.dto.TicketRequests;
import com.ticketdesk.dto.TicketResponses;
import com.ticketdesk.exception.UnauthorizedException;
import com.ticketdesk.model.*;
import com.ticketdesk.repository.TicketActivityRepository;
import com.ticketdesk.repository.TicketRepository;
import com.ticketdesk.repository.UserRepository;
import com.ticketdesk.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketActivityRepository activityRepository;

    @Mock
    private UserRepository userRepository;

    private TicketService ticketService;

    private User employee;
    private User otherEmployee;
    private User agent;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(ticketRepository, activityRepository, userRepository);
        employee = new User(UUID.randomUUID(), "Alice Employee", "alice@test.com", "hash", Role.EMPLOYEE);
        otherEmployee = new User(UUID.randomUUID(), "Bob Other", "bob@test.com", "hash", Role.EMPLOYEE);
        agent = new User(UUID.randomUUID(), "Charlie Agent", "charlie@test.com", "hash", Role.SUPPORT_AGENT);
    }

    @Test
    @DisplayName("Create ticket should persist ticket in OPEN status with human-readable ID and record activity")
    void createTicket_Success() {
        TicketRequests.CreateTicketRequest request = new TicketRequests.CreateTicketRequest(
                "Monitor not working", "HDMI port faulty", TicketCategory.HARDWARE, TicketPriority.HIGH
        );

        when(ticketRepository.countTotalTickets()).thenReturn(5L);
        when(ticketRepository.findByTicketNumber(anyString())).thenReturn(Optional.empty());
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(activityRepository.findByTicketOrderByCreatedAtDesc(any(Ticket.class))).thenReturn(Collections.emptyList());

        TicketResponses.TicketDetailResponse response = ticketService.createTicket(request, employee);

        assertNotNull(response);
        assertEquals("Monitor not working", response.getSubject());
        assertEquals(TicketStatus.OPEN, response.getStatus());
        assertEquals(TicketPriority.HIGH, response.getPriority());
        assertEquals(TicketCategory.HARDWARE, response.getCategory());
        assertTrue(response.getTicketNumber().startsWith("TKT-"));
        verify(activityRepository, times(1)).save(any(TicketActivity.class));
    }

    @Test
    @DisplayName("Employee cannot view ticket created by another employee")
    void getTicketById_ForbiddenForOtherEmployee() {
        UUID ticketId = UUID.randomUUID();
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        ticket.setCreatedBy(otherEmployee);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        assertThrows(UnauthorizedException.class, () -> ticketService.getTicketById(ticketId, employee));
    }

    @Test
    @DisplayName("Agent can update status from OPEN to IN_PROGRESS")
    void updateTicketStatus_AgentAllowed() {
        UUID ticketId = UUID.randomUUID();
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(employee);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));
        when(activityRepository.findByTicketOrderByCreatedAtDesc(any(Ticket.class))).thenReturn(Collections.emptyList());

        TicketResponses.TicketDetailResponse response =
                ticketService.updateTicketStatus(ticketId, TicketStatus.IN_PROGRESS, agent);

        assertEquals(TicketStatus.IN_PROGRESS, response.getStatus());
        verify(activityRepository, times(1)).save(any(TicketActivity.class));
    }

    @Test
    @DisplayName("Employee cannot update ticket status")
    void updateTicketStatus_EmployeeForbidden() {
        UUID ticketId = UUID.randomUUID();
        Ticket ticket = new Ticket();
        ticket.setId(ticketId);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(employee);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(ticket));

        assertThrows(UnauthorizedException.class, () ->
                ticketService.updateTicketStatus(ticketId, TicketStatus.RESOLVED, employee));
    }
}

