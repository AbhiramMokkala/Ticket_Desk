using TicketDesk.CommentService.Models;

namespace TicketDesk.CommentService.Services;

public interface ICommentService
{
    Task<List<CommentResponse>> GetCommentsByTicketIdAsync(Guid ticketId, Guid userId, string userRole, string userName);
    Task<CommentResponse?> AddCommentAsync(Guid ticketId, Guid userId, string userRole, string userName, CreateCommentRequest request);
}
