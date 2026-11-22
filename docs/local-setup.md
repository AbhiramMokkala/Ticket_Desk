# Local Development Setup Guide

TicketDesk is designed to run locally using Docker Compose without needing an AWS account or internet connectivity.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Docker Desktop** (version 24.0+ or Docker Engine with Docker Compose v2)
- **Git**
- **Web Browser**

---

## 2. Step-by-Step Local Startup

### Step 1: Open Terminal & Clone Repository
```bash
git clone <repository-url>
cd ticketdesk
```

### Step 2: Configure Environment Variables
Copy the provided environment template:
```bash
cp .env.example .env
```
*(On Windows CMD: `copy .env.example .env`)*

The `.env` file comes preconfigured for local Docker networking with sensible defaults.

### Step 3: Build & Launch Containers
Execute the single-command startup:
```bash
docker compose up --build -d
```

### Step 4: Verify Container Health
```bash
docker compose ps
```
All five containers should report `healthy` or `running`:
- `ticketdesk-postgres`
- `ticketdesk-java-service`
- `ticketdesk-dotnet-service`
- `ticketdesk-python-service`
- `ticketdesk-frontend`

---

## 3. Accessing the Application

- **Web Dashboard:** Open your browser to [http://localhost](http://localhost)
- **Login Credentials:**
  - **Administrator:** `admin@ticketdesk.local` / `Admin@12345`
  - **Support Agent:** `agent@ticketdesk.local` / `Agent@12345`
  - **Employee:** `employee@ticketdesk.local` / `Employee@12345`

---

## 4. Useful Local Commands

| Action | Command |
|---|---|
| View real-time logs | `docker compose logs -f` |
| View specific service logs | `docker compose logs -f java-ticket-service` |
| Stop all containers | `docker compose down` |
| Stop and wipe database volume | `docker compose down -v` |
| Rebuild all images | `docker compose build --no-cache` |
