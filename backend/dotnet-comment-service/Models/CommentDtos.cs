using System.ComponentModel.DataAnnotations;

namespace TicketDesk.CommentService.Models;

public class CreateCommentRequest
{
    [Required(ErrorMessage = "Comment text is required")]
    [MinLength(1, ErrorMessage = "Comment cannot be empty")]
    [MaxLength(4000, ErrorMessage = "Comment cannot exceed 4000 characters")]
    public string Comment { get; set; } = string.Empty;
}

public class CommentResponse
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class InternalAuthVerifyResponse
{
    public Guid TicketId { get; set; }
    public bool CanAccess { get; set; }
    public string? Role { get; set; }
    public bool IsOwner { get; set; }
    public bool IsAssigned { get; set; }
    public string? Reason { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Error(string message) =>
        new() { Success = false, Message = message, Data = default };
}
