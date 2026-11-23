package com.ticketdesk.dto;

import com.ticketdesk.model.Role;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AuthResponses {

    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private UUID userId;
        private String fullName;
        private String email;
        private Role role;
        private long expiresInHours;

        public AuthResponse(String token, UUID userId, String fullName, String email, Role role, long expiresInHours) {
            this.token = token;
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.expiresInHours = expiresInHours;
        }

        public String getToken() { return token; }
        public String getTokenType() { return tokenType; }
        public UUID getUserId() { return userId; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public Role getRole() { return role; }
        public long getExpiresInHours() { return expiresInHours; }
    }

    public static class UserProfileResponse {
        private UUID id;
        private String fullName;
        private String email;
        private Role role;
        private OffsetDateTime createdAt;

        public UserProfileResponse(UUID id, String fullName, String email, Role role, OffsetDateTime createdAt) {
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
}

