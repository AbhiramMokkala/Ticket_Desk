using System.Net.Http.Json;
using TicketDesk.CommentService.Models;

namespace TicketDesk.CommentService.Services;

public class JavaAuthClient : IJavaAuthClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<JavaAuthClient> _logger;

    public JavaAuthClient(HttpClient httpClient, IConfiguration configuration, ILogger<JavaAuthClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<InternalAuthVerifyResponse?> VerifyTicketAccessAsync(Guid ticketId, Guid userId)
    {
        try
        {
            var secretKey = _configuration["InternalAuth:SecretKey"] ?? "TicketDeskInternalServiceAuthSecret2026!";
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/internal/tickets/{ticketId}/verify-access?userId={userId}");
            request.Headers.Add("X-Internal-Service-Key", secretKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Internal auth check returned status {StatusCode} for ticket {TicketId}", response.StatusCode, ticketId);
                return new InternalAuthVerifyResponse { TicketId = ticketId, CanAccess = false, Reason = "Access denied or ticket not found" };
            }

            return await response.Content.ReadFromJsonAsync<InternalAuthVerifyResponse>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to reach Java internal authorization service for ticket {TicketId}", ticketId);
            // In case of transient network error, fail secure (closed)
            return new InternalAuthVerifyResponse { TicketId = ticketId, CanAccess = false, Reason = "Internal authorization check unavailable" };
        }
    }
}
