using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TicketDesk.CommentService.Data;
using TicketDesk.CommentService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=postgres;Port=5432;Database=ticketdesk_db;Username=ticketdesk_user;Password=ticketdesk_secure_password_2026";
builder.Services.AddDbContext<CommentDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add HttpClient for cross-service authorization with Java service
builder.Services.AddHttpClient<IJavaAuthClient, JavaAuthClient>(client =>
{
    var javaUrl = builder.Configuration["Services:JavaServiceUrl"] ?? "http://java-ticket-service:8080";
    client.BaseAddress = new Uri(javaUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

// Add Application Services
builder.Services.AddScoped<ICommentService, CommentService>();

// Configure JWT Authentication (Matching Java Service JWT Configuration)
var jwtSecret = builder.Configuration["Jwt:Secret"] 
    ?? "TicketDeskJwtSecretKeyForEnterprisePOC2026SecureStringMustBe256BitsLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ticketdesk-auth-service";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ticketdesk-platform";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-migrate database table if not present
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<CommentDbContext>();
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Database schema check completed or deferred to Flyway.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run("http://0.0.0.0:8081");

