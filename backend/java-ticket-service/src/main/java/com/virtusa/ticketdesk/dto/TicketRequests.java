package com.virtusa.ticketdesk.dto;

import com.virtusa.ticketdesk.model.TicketCategory;
import com.virtusa.ticketdesk.model.TicketPriority;
import com.virtusa.ticketdesk.model.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class TicketRequests {

    public static class CreateTicketRequest {
        @NotBlank(message = "Subject is required")
        @Size(max = 255, message = "Subject cannot exceed 255 characters")
        private String subject;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private TicketCategory category;

        @NotNull(message = "Priority is required")
        private TicketPriority priority;

        public CreateTicketRequest() {}

        public CreateTicketRequest(String subject, String description, TicketCategory category, TicketPriority priority) {
            this.subject = subject;
            this.description = description;
            this.category = category;
            this.priority = priority;
        }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public TicketCategory getCategory() { return category; }
        public void setCategory(TicketCategory category) { this.category = category; }
        public TicketPriority getPriority() { return priority; }
        public void setPriority(TicketPriority priority) { this.priority = priority; }
    }

    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private TicketStatus status;

        public UpdateStatusRequest() {}
        public UpdateStatusRequest(TicketStatus status) { this.status = status; }

        public TicketStatus getStatus() { return status; }
        public void setStatus(TicketStatus status) { this.status = status; }
    }

    public static class AssignTicketRequest {
        @NotNull(message = "Agent user ID is required")
        private UUID agentId;

        public AssignTicketRequest() {}
        public AssignTicketRequest(UUID agentId) { this.agentId = agentId; }

        public UUID getAgentId() { return agentId; }
        public void setAgentId(UUID agentId) { this.agentId = agentId; }
    }
}
