#!/usr/bin/env bash
# TicketDesk EC2 Remote Deployment Script
set -e

APP_DIR="/opt/ticketdesk"

echo "=== Deploying TicketDesk on Amazon EC2 ==="

cd "${APP_DIR}"

echo "1. Checking environment configuration..."
if [ ! -f .env.production ]; then
    echo "Error: .env.production missing in ${APP_DIR}."
    exit 1
fi

echo "2. Re-building and restarting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --remove-orphans

echo "3. Verifying microservice health..."
sleep 15
curl -f http://localhost/health || (echo "Health check failed!" && exit 1)

echo "=== Deployment Successfully Completed ==="
