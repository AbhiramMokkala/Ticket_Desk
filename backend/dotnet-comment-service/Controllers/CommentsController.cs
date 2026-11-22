using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketDesk.CommentService.Models;
using TicketDesk.CommentService.Services;

namespace TicketDesk.CommentService.Controllers;

[ApiController]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(ICommentService commentService, ILogger<CommentsController> logger)
    {
        _commentService = commentService;
        _logger = logger;
    }

    [HttpGet("api/tickets/{ticketId:guid}/comments")]
    public async Task<IActionResult> GetComments([FromRoute] Guid ticketId)
    {
        var (userId, role, name) = ExtractUserClaims();
        if (userId == Guid.Empty)
        {
            return Unauthorized(ApiResponse<string>.Error("Invalid or missing user identity in JWT"));
        }

        try
        {
            var comments = await _commentService.GetCommentsByTicketIdAsync(ticketId, userId, role, name);
            return Ok(ApiResponse<List<CommentResponse>>.Ok(comments, "Comments retrieved successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for ticket {TicketId}", ticketId);
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.Error("Failed to retrieve comments"));
        }
    }

    [HttpPost("api/tickets/{ticketId:guid}/comments")]
    public async Task<IActionResult> CreateComment(
        [FromRoute] Guid ticketId,
        [FromBody] CreateCommentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.Error("Validation failed"));
        }

        var (userId, role, name) = ExtractUserClaims();
        if (userId == Guid.Empty)
        {
            return Unauthorized(ApiResponse<string>.Error("Invalid or missing user identity in JWT"));
        }

        try
        {
            var comment = await _commentService.AddCommentAsync(ticketId, userId, role, name, request);
            return StatusCode(StatusCodes.Status201Created, ApiResponse<CommentResponse>.Ok(comment!, "Comment created successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<string>.Error(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment to ticket {TicketId}", ticketId);
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.Error("Failed to add comment"));
        }
    }

    private (Guid userId, string role, string name) ExtractUserClaims()
    {
        var userIdStr = User.FindFirst("userId")?.Value 
                     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid.TryParse(userIdStr, out var userId);

        var role = User.FindFirst("role")?.Value 
                ?? User.FindFirst(ClaimTypes.Role)?.Value 
                ?? "EMPLOYEE";
        // Clean up role string if it starts with ROLE_
        if (role.StartsWith("ROLE_"))
        {
            role = role.Substring(5);
        }

        var name = User.FindFirst("fullName")?.Value 
                ?? User.FindFirst(ClaimTypes.Name)?.Value 
                ?? "User";

        return (userId, role, name);
    }
}
