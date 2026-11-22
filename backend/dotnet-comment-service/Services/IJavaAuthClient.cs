using TicketDesk.CommentService.Models;

namespace TicketDesk.CommentService.Services;

public interface IJavaAuthClient
{
    Task<InternalAuthVerifyResponse?> VerifyTicketAccessAsync(Guid ticketId, Guid userId);
}
