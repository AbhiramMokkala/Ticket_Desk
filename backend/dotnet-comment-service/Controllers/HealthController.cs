using Microsoft.AspNetCore.Mvc;

namespace TicketDesk.CommentService.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "UP",
            service = "dotnet-comment-service",
            framework = ".NET 8.0 ASP.NET Core",
            timestamp = DateTime.UtcNow
        });
    }
}
