using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TicketDesk.CommentService.Data;
using TicketDesk.CommentService.Models;
using TicketDesk.CommentService.Services;
using Xunit;

namespace TicketDesk.CommentService.Tests;

public class CommentServiceTests
{
    private CommentDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<CommentDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new CommentDbContext(options);
    }

    [Fact]
    public async Task AddComment_AuthorizedAgent_SavesSuccessfully()
    {
        // Arrange
        using var dbContext = GetInMemoryDbContext();
        var mockAuthClient = new Mock<IJavaAuthClient>();
        var mockLogger = new Mock<ILogger<Services.CommentService>>();
        var service = new Services.CommentService(dbContext, mockAuthClient.Object, mockLogger.Object);

        var ticketId = Guid.NewGuid();
        var agentId = Guid.NewGuid();
        var request = new CreateCommentRequest { Comment = "Investigating your network issue." };

        // Act
        var result = await service.AddCommentAsync(ticketId, agentId, "SUPPORT_AGENT", "Agent Smith", request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Investigating your network issue.", result.Comment);
        Assert.Equal(ticketId, result.TicketId);
        Assert.Equal(agentId, result.UserId);
        Assert.Single(dbContext.Comments);
    }

    [Fact]
    public async Task AddComment_AuthorizedEmployee_CallsAuthAndSaves()
    {
        // Arrange
        using var dbContext = GetInMemoryDbContext();
        var mockAuthClient = new Mock<IJavaAuthClient>();
        var mockLogger = new Mock<ILogger<Services.CommentService>>();

        var ticketId = Guid.NewGuid();
        var employeeId = Guid.NewGuid();
        var request = new CreateCommentRequest { Comment = "Thank you, here is the error screenshot." };

        mockAuthClient
            .Setup(c => c.VerifyTicketAccessAsync(ticketId, employeeId))
            .ReturnsAsync(new InternalAuthVerifyResponse { TicketId = ticketId, CanAccess = true });

        var service = new Services.CommentService(dbContext, mockAuthClient.Object, mockLogger.Object);

        // Act
        var result = await service.AddCommentAsync(ticketId, employeeId, "EMPLOYEE", "Jane Doe", request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Thank you, here is the error screenshot.", result.Comment);
        mockAuthClient.Verify(c => c.VerifyTicketAccessAsync(ticketId, employeeId), Times.Once);
    }

    [Fact]
    public async Task AddComment_UnauthorizedEmployee_ThrowsUnauthorizedException()
    {
        // Arrange
        using var dbContext = GetInMemoryDbContext();
        var mockAuthClient = new Mock<IJavaAuthClient>();
        var mockLogger = new Mock<ILogger<Services.CommentService>>();

        var ticketId = Guid.NewGuid();
        var employeeId = Guid.NewGuid();
        var request = new CreateCommentRequest { Comment = "Trying to access someone else's ticket." };

        mockAuthClient
            .Setup(c => c.VerifyTicketAccessAsync(ticketId, employeeId))
            .ReturnsAsync(new InternalAuthVerifyResponse { TicketId = ticketId, CanAccess = false, Reason = "Unauthorized" });

        var service = new Services.CommentService(dbContext, mockAuthClient.Object, mockLogger.Object);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.AddCommentAsync(ticketId, employeeId, "EMPLOYEE", "Attacker", request));
    }
}
