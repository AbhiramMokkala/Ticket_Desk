package com.ticketdesk.repository;

import com.ticketdesk.model.Ticket;
import com.ticketdesk.model.TicketPriority;
import com.ticketdesk.model.TicketStatus;
import com.ticketdesk.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);

    // Eagerly fetch createdBy and assignedTo to prevent LazyInitializationException
    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignedTo WHERE t.id = :id")
    Optional<Ticket> findByIdWithUsers(@Param("id") UUID id);

    @Query(value = "SELECT t FROM Ticket t " +
           "WHERE (:createdBy IS NULL OR t.createdBy = :createdBy) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:searchPattern IS NULL OR LOWER(t.subject) LIKE :searchPattern OR LOWER(t.ticketNumber) LIKE :searchPattern)",
           countQuery = "SELECT COUNT(t) FROM Ticket t " +
           "WHERE (:createdBy IS NULL OR t.createdBy = :createdBy) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:searchPattern IS NULL OR LOWER(t.subject) LIKE :searchPattern OR LOWER(t.ticketNumber) LIKE :searchPattern)")
    Page<Ticket> searchTickets(
            @Param("createdBy") User createdBy,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("searchPattern") String searchPattern,
            Pageable pageable);

    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);

    long countByCreatedByAndStatus(User createdBy, TicketStatus status);
    long countByCreatedByAndPriority(User createdBy, TicketPriority priority);

    long countByCreatedBy(User createdBy);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignedTo ORDER BY t.createdAt DESC")
    List<Ticket> findTop5WithUsersOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignedTo " +
           "WHERE t.createdBy = :createdBy ORDER BY t.createdAt DESC")
    List<Ticket> findTop5ByCreatedByWithUsersOrderByCreatedAtDesc(@Param("createdBy") User createdBy, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Ticket t")
    long countTotalTickets();
}

