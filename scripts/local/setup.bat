@echo off
REM TicketDesk Local Setup for Windows PowerShell / CMD

echo === Setting up TicketDesk Local Environment ===

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
) else (
    echo .env file already exists.
)

echo Starting Docker Compose...
docker compose up --build -d

echo.
echo === TicketDesk Services Launched ===
echo Web UI: http://localhost
echo.
pause
