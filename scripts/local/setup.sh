#!/usr/bin/env bash
# TicketDesk Local Development Initialization Script

set -e

echo "=== Starting TicketDesk Local Environment Setup ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${ROOT_DIR}"

# 1. Prepare .env file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
else
    echo ".env file already exists."
fi

# 2. Build and start containers
echo "Building and starting local microservices via Docker Compose..."
docker compose up --build -d

echo ""
echo "=== TicketDesk is now initializing ==="
echo "PostgreSQL: http://localhost:5432"
echo "Java Ticket Service: http://localhost:8080"
echo ".NET Comment Service: http://localhost:8081"
echo "Python Attachment Service: http://localhost:8082"
echo "Frontend & Nginx Gateway: http://localhost"
echo ""
echo "Check status anytime with: docker compose ps"
