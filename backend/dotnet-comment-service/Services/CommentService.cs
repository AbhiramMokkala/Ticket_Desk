using Microsoft.EntityFrameworkCore;
using TicketDesk.CommentService.Data;
using TicketDesk.CommentService.Models;

namespace TicketDesk.CommentService.Services;

public class CommentService : ICommentService
{
    private readonly CommentDbContext _dbContext;
    private readonly IJavaAuthClient _authClient;
    private readonly ILogger<CommentService> _logger;

    public CommentService(CommentDbContext dbContext, IJavaAuthClient authClient, ILogger<CommentService> logger)
    {
        _dbContext = dbContext;
        _authClient = authClient;
        _logger = logger;
    }

    public async Task<List<CommentResponse>> GetCommentsByTicketIdAsync(
        Guid ticketId, Guid userId, string userRole, string userName)
    {
        // 1. Verify access authorization
        bool isPrivileged = userRole is "ADMINISTRATOR" or "SUPPORT_AGENT";
        if (!isPrivileged)
        {
            var authCheck = await _authClient.VerifyTicketAccessAsync(ticketId, userId);
            if (authCheck == null || !authCheck.CanAccess)
            {
                throw new UnauthorizedAccessException("You are not authorized to view comments for this ticket.");
            }
        }

        // 2. Fetch comments from PostgreSQL
        var comments = await _dbContext.Comments
            .Where(c => c.TicketId == ticketId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        return comments.Select(c => new CommentResponse
        {
            Id = c.Id,
            TicketId = c.TicketId,
            UserId = c.UserId,
            UserName = (c.UserId == userId) ? userName : "Ticket Contributor",
            UserRole = (c.UserId == userId) ? userRole : "SUPPORT_TEAM",
            Comment = c.Text,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task<CommentResponse?> AddCommentAsync(
        Guid ticketId, Guid userId, string userRole, string userName, CreateCommentRequest request)
    {
        // 1. Verify access authorization
        bool isPrivileged = userRole is "ADMINISTRATOR" or "SUPPORT_AGENT";
        if (!isPrivileged)
        {
            var authCheck = await _authClient.VerifyTicketAccessAsync(ticketId, userId);
            if (authCheck == null || !authCheck.CanAccess)
            {
                throw new UnauthorizedAccessException("You are not authorized to comment on this ticket.");
            }
        }

        // 2. Persist comment
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            TicketId = ticketId,
            UserId = userId,
            Text = request.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Comments.Add(comment);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Comment {CommentId} added to Ticket {TicketId} by User {UserId}", comment.Id, ticketId, userId);

        return new CommentResponse
        {
            Id = comment.Id,
            TicketId = comment.TicketId,
            UserId = comment.UserId,
            UserName = userName,
            UserRole = userRole,
            Comment = comment.Text,
            CreatedAt = comment.CreatedAt
        };
    }
}
