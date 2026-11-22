package com.virtusa.ticketdesk.dto;

import com.virtusa.ticketdesk.model.Role;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class UserManagementDto {

    public static class UserSummaryResponse {
        private UUID id;
        private String fullName;
        private String email;
        private Role role;
        private OffsetDateTime createdAt;

        public UserSummaryResponse(UUID id, String fullName, String email, Role role, OffsetDateTime createdAt) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.createdAt = createdAt;
        }

        public UUID getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public Role getRole() { return role; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
    }

    public static class UpdateRoleRequest {
        @NotNull(message = "Role is required")
        private Role role;

        public UpdateRoleRequest() {}
        public UpdateRoleRequest(Role role) { this.role = role; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    public static class UserStatsResponse {
        private long totalUsers;
        private long totalEmployees;
        private long totalAgents;
        private long totalAdmins;

        public UserStatsResponse(long totalUsers, long totalEmployees, long totalAgents, long totalAdmins) {
            this.totalUsers = totalUsers;
            this.totalEmployees = totalEmployees;
            this.totalAgents = totalAgents;
            this.totalAdmins = totalAdmins;
        }

        public long getTotalUsers() { return totalUsers; }
        public long getTotalEmployees() { return totalEmployees; }
        public long getTotalAgents() { return totalAgents; }
        public long getTotalAdmins() { return totalAdmins; }
    }
}
