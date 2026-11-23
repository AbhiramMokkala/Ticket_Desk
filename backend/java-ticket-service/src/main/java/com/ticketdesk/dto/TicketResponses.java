package com.ticketdesk.dto;

import com.ticketdesk.model.TicketCategory;
import com.ticketdesk.model.TicketPriority;
import com.ticketdesk.model.TicketStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TicketResponses {

    public static class TicketSummaryResponse {
        private UUID id;
        private String ticketNumber;
        private String subject;
        private TicketCategory category;
        private TicketPriority priority;
        private TicketStatus status;
        private UUID createdById;
        private String createdByName;
        private UUID assignedToId;
        private String assignedToName;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public TicketSummaryResponse() {}

        public TicketSummaryResponse(UUID id, String ticketNumber, String subject,
                                     TicketCategory category, TicketPriority priority, TicketStatus status,
                                     UUID createdById, String createdByName,
                                     UUID assignedToId, String assignedToName,
                                     OffsetDateTime createdAt, OffsetDateTime updatedAt) {
            this.id = id;
            this.ticketNumber = ticketNumber;
            this.subject = subject;
            this.category = category;
            this.priority = priority;
            this.status = status;
            this.createdById = createdById;
            this.createdByName = createdByName;
            this.assignedToId = assignedToId;
            this.assignedToName = assignedToName;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public UUID getId() { return id; }
        public String getTicketNumber() { return ticketNumber; }
        public String getSubject() { return subject; }
        public TicketCategory getCategory() { return category; }
        public TicketPriority getPriority() { return priority; }
        public TicketStatus getStatus() { return status; }
        public UUID getCreatedById() { return createdById; }
        public String getCreatedByName() { return createdByName; }
        public UUID getAssignedToId() { return assignedToId; }
        public String getAssignedToName() { return assignedToName; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
        public OffsetDateTime getUpdatedAt() { return updatedAt; }
    }

    public static class TicketDetailResponse {
        private UUID id;
        private String ticketNumber;
        private String subject;
        private String description;
        private TicketCategory category;
        private TicketPriority priority;
        private TicketStatus status;
        private UUID createdById;
        private String createdByName;
        private String createdByEmail;
        private UUID assignedToId;
        private String assignedToName;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;
        private List<ActivityItemResponse> activities;

        public TicketDetailResponse() {}

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getTicketNumber() { return ticketNumber; }
        public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TicketCategory getCategory() { return category; }
        public void setCategory(TicketCategory category) { this.category = category; }
        public TicketPriority getPriority() { return priority; }
        public void setPriority(TicketPriority priority) { this.priority = priority; }
        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
        public UUID getCreatedById() { return createdById; }
        public void setCreatedById(UUID createdById) { this.createdById = createdById; }
        public String getCreatedByName() { return createdByName; }
        public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
        public String getCreatedByEmail() { return createdByEmail; }
        public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }
        public UUID getAssignedToId() { return assignedToId; }
        public void setAssignedToId(UUID assignedToId) { this.assignedToId = assignedToId; }
        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
        public OffsetDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
        public List<ActivityItemResponse> getActivities() { return activities; }
        public void setActivities(List<ActivityItemResponse> activities) { this.activities = activities; }
    }

    public static class ActivityItemResponse {
        private UUID id;
        private String action;
        private String oldValue;
        private String newValue;
        private String performedByName;
        private OffsetDateTime createdAt;

        public ActivityItemResponse(UUID id, String action, String oldValue, String newValue, String performedByName, OffsetDateTime createdAt) {
            this.id = id;
            this.action = action;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.performedByName = performedByName;
            this.createdAt = createdAt;
        }

        public UUID getId() { return id; }
        public String getAction() { return action; }
        public String getOldValue() { return oldValue; }
        public String getNewValue() { return newValue; }
        public String getPerformedByName() { return performedByName; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
    }

    public static class DashboardStatsResponse {
        private long totalTickets;
        private long openTickets;
        private long inProgressTickets;
        private long resolvedTickets;
        private long closedTickets;
        private Map<String, Long> priorityDistribution;
        private List<TicketSummaryResponse> recentTickets;

        public DashboardStatsResponse(long totalTickets, long openTickets, long inProgressTickets,
                                      long resolvedTickets, long closedTickets,
                                      Map<String, Long> priorityDistribution,
                                      List<TicketSummaryResponse> recentTickets) {
            this.totalTickets = totalTickets;
            this.openTickets = openTickets;
            this.inProgressTickets = inProgressTickets;
            this.resolvedTickets = resolvedTickets;
            this.closedTickets = closedTickets;
            this.priorityDistribution = priorityDistribution;
            this.recentTickets = recentTickets;
        }

        public long getTotalTickets() { return totalTickets; }
        public long getOpenTickets() { return openTickets; }
        public long getInProgressTickets() { return inProgressTickets; }
        public long getResolvedTickets() { return resolvedTickets; }
        public long getClosedTickets() { return closedTickets; }
        public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
        public List<TicketSummaryResponse> getRecentTickets() { return recentTickets; }
    }
}

