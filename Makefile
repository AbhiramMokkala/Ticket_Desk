.PHONY: help build up down restart logs ps clean test test-java test-dotnet test-python

help:
	@echo "TicketDesk Management Commands:"
	@echo "  make build         - Build all microservice Docker images"
	@echo "  make up            - Start all services locally (Postgres, Java, .NET, Python, UI)"
	@echo "  make down          - Stop and remove all containers"
	@echo "  make restart       - Restart all containers"
	@echo "  make logs          - Tail container logs"
	@echo "  make ps            - Check container status"
	@echo "  make test          - Run all test suites (Java, .NET, Python)"
	@echo "  make test-java     - Run Java JUnit tests"
	@echo "  make test-dotnet   - Run .NET xUnit tests"
	@echo "  make test-python   - Run Python pytest tests"
	@echo "  make clean         - Remove temporary files and containers"

build:
	docker compose build

up:
	docker compose up -d
	@echo "TicketDesk starting up... View at http://localhost"

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

test: test-java test-dotnet test-python

test-java:
	cd backend/java-ticket-service && mvn clean test

test-dotnet:
	cd backend/dotnet-comment-service && dotnet test

test-python:
	cd backend/python-attachment-service && pytest

clean:
	docker compose down -v --remove-orphans
