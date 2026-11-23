package com.ticketdesk.repository;

import com.ticketdesk.model.Ticket;
import com.ticketdesk.model.TicketActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketActivityRepository extends JpaRepository<TicketActivity, UUID> {
    @Query("SELECT a FROM TicketActivity a LEFT JOIN FETCH a.performedBy WHERE a.ticket = :ticket ORDER BY a.createdAt DESC")
    List<TicketActivity> findByTicketOrderByCreatedAtDesc(@Param("ticket") Ticket ticket);
}

