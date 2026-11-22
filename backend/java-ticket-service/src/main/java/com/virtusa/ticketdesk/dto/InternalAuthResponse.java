package com.virtusa.ticketdesk.dto;

import com.virtusa.ticketdesk.model.Role;
import java.util.UUID;

public class InternalAuthResponse {
    private UUID ticketId;
    private boolean canAccess;
    private Role role;
    private boolean isOwner;
    private boolean isAssigned;
    private String reason;

    public InternalAuthResponse() {}

    public InternalAuthResponse(UUID ticketId, boolean canAccess, Role role, boolean isOwner, boolean isAssigned, String reason) {
        this.ticketId = ticketId;
        this.canAccess = canAccess;
        this.role = role;
        this.isOwner = isOwner;
        this.isAssigned = isAssigned;
        this.reason = reason;
    }

    public UUID getTicketId() { return ticketId; }
    public boolean isCanAccess() { return canAccess; }
    public Role getRole() { return role; }
    public boolean isOwner() { return isOwner; }
    public boolean isAssigned() { return isAssigned; }
    public String getReason() { return reason; }
}
