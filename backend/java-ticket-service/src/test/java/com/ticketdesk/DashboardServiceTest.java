package com.ticketdesk;

import com.ticketdesk.dto.TicketResponses;
import com.ticketdesk.model.Role;
import com.ticketdesk.model.TicketPriority;
import com.ticketdesk.model.TicketStatus;
import com.ticketdesk.model.User;
import com.ticketdesk.repository.TicketRepository;
import com.ticketdesk.service.DashboardService;
import com.ticketdesk.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketService ticketService;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(ticketRepository, ticketService);
    }

    @Test
    @DisplayName("Agent sees global dashboard statistics")
    void getDashboardStats_ForAgent_GlobalStats() {
        User agent = new User(UUID.randomUUID(), "Agent", "agent@test.com", "hash", Role.SUPPORT_AGENT);

        when(ticketRepository.countTotalTickets()).thenReturn(10L);
        when(ticketRepository.countByStatus(TicketStatus.OPEN)).thenReturn(4L);
        when(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS)).thenReturn(3L);
        when(ticketRepository.countByStatus(TicketStatus.RESOLVED)).thenReturn(2L);
        when(ticketRepository.countByStatus(TicketStatus.CLOSED)).thenReturn(1L);
        when(ticketRepository.findTop5WithUsersOrderByCreatedAtDesc(PageRequest.of(0, 5))).thenReturn(Collections.emptyList());

        TicketResponses.DashboardStatsResponse stats = dashboardService.getDashboardStats(agent);

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalTickets());
        assertEquals(4L, stats.getOpenTickets());
        assertEquals(3L, stats.getInProgressTickets());
        assertEquals(2L, stats.getResolvedTickets());
        assertEquals(1L, stats.getClosedTickets());
    }

    @Test
    @DisplayName("Employee sees only personal dashboard statistics")
    void getDashboardStats_ForEmployee_ScopedStats() {
        User employee = new User(UUID.randomUUID(), "Employee", "emp@test.com", "hash", Role.EMPLOYEE);

        when(ticketRepository.countByCreatedBy(employee)).thenReturn(2L);
        when(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.OPEN)).thenReturn(1L);
        when(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.IN_PROGRESS)).thenReturn(1L);
        when(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.RESOLVED)).thenReturn(0L);
        when(ticketRepository.countByCreatedByAndStatus(employee, TicketStatus.CLOSED)).thenReturn(0L);
        when(ticketRepository.findTop5ByCreatedByWithUsersOrderByCreatedAtDesc(employee, PageRequest.of(0, 5))).thenReturn(Collections.emptyList());

        TicketResponses.DashboardStatsResponse stats = dashboardService.getDashboardStats(employee);

        assertNotNull(stats);
        assertEquals(2L, stats.getTotalTickets());
        assertEquals(1L, stats.getOpenTickets());
        assertEquals(1L, stats.getInProgressTickets());
        verify(ticketRepository, never()).countTotalTickets();
    }
}

