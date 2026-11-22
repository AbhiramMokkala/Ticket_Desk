# Multi-stage Dockerfile for .NET 8 Comment Service
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build

WORKDIR /src

COPY ["TicketDesk.CommentService.csproj", "./"]
RUN dotnet restore "./TicketDesk.CommentService.csproj"

COPY . .
RUN dotnet publish "./TicketDesk.CommentService.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /app/publish .

# Run as non-root user for security best practices
USER $APP_UID

EXPOSE 8081

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

ENTRYPOINT ["dotnet", "TicketDesk.CommentService.dll"]
