package com.ticketdesk.service;

import com.ticketdesk.dto.TicketResponses;
import com.ticketdesk.model.Role;
import com.ticketdesk.model.Ticket;
import com.ticketdesk.model.TicketPriority;
import com.ticketdesk.model.TicketStatus;
import com.ticketdesk.model.User;
import com.ticketdesk.repository.TicketRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    public DashboardService(TicketRepository ticketRepository, TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
    }

    @Transactional(readOnly = true)
    public TicketResponses.DashboardStatsResponse getDashboardStats(User currentUser) {
        long total;
        long open;
        long inProgress;
        long resolved;
        long closed;
        Map<String, Long> priorityMap = new HashMap<>();
        List<Ticket> recentList;

        if (currentUser.getRole() == Role.EMPLOYEE) {
            total = ticketRepository.countByCreatedBy(currentUser);
            open = ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.OPEN);
            inProgress = ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.IN_PROGRESS);
            resolved = ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.RESOLVED);
            closed = ticketRepository.countByCreatedByAndStatus(currentUser, TicketStatus.CLOSED);

            for (TicketPriority p : TicketPriority.values()) {
                priorityMap.put(p.name(), ticketRepository.countByCreatedByAndPriority(currentUser, p));
            }
            recentList = ticketRepository.findTop5ByCreatedByWithUsersOrderByCreatedAtDesc(
                    currentUser, PageRequest.of(0, 5));
        } else {
            total = ticketRepository.countTotalTickets();
            open = ticketRepository.countByStatus(TicketStatus.OPEN);
            inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
            resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);
            closed = ticketRepository.countByStatus(TicketStatus.CLOSED);

            for (TicketPriority p : TicketPriority.values()) {
                priorityMap.put(p.name(), ticketRepository.countByPriority(p));
            }
            recentList = ticketRepository.findTop5WithUsersOrderByCreatedAtDesc(PageRequest.of(0, 5));
        }

        List<TicketResponses.TicketSummaryResponse> recentDtos = recentList.stream()
                .map(ticketService::toSummaryResponse)
                .collect(Collectors.toList());

        return new TicketResponses.DashboardStatsResponse(
                total,
                open,
                inProgress,
                resolved,
                closed,
                priorityMap,
                recentDtos
        );
    }
}

