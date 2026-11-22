# TicketDesk REST API Documentation

All API traffic is routed through the single Nginx entry point on port 80.

---

## 1. Authentication & User Management (Java Spring Boot)

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public (Always assigns `EMPLOYEE` role)
- **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane.doe@company.com",
    "password": "Password@12345"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "userId": "33333333-3333-3333-3333-333333333333",
      "fullName": "Jane Doe",
      "email": "jane.doe@company.com",
      "role": "EMPLOYEE",
      "expiresInHours": 24
    }
  }
  ```

### Log In
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@ticketdesk.local",
    "password": "Admin@12345"
  }
  ```
- **Response:** `200 OK`

### Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Header:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

### List All Users (Admin Only)
- **Endpoint:** `GET /api/users`
- **Access:** `ADMINISTRATOR`

### Update User Role (Admin Only)
- **Endpoint:** `PATCH /api/users/{id}/role`
- **Access:** `ADMINISTRATOR`
- **Request Body:** `{"role": "SUPPORT_AGENT"}`

---

## 2. Ticket Operations (Java Spring Boot)

### Create Ticket
- **Endpoint:** `POST /api/tickets`
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "subject": "VPN connection drops every 15 minutes",
    "description": "Cisco AnyConnect drops connection intermittently.",
    "category": "NETWORK",
    "priority": "HIGH"
  }
  ```
- **Response:** `201 Created` (Generates human-readable ID e.g., `TKT-000001`)

### List Tickets
- **Endpoint:** `GET /api/tickets?status=OPEN&priority=HIGH&search=VPN&page=0&size=10`
- **Behavior:**
  - `EMPLOYEE`: Returns only tickets authored by the authenticated employee.
  - `SUPPORT_AGENT` / `ADMINISTRATOR`: Returns all tickets across the enterprise.

### Get Ticket Details
- **Endpoint:** `GET /api/tickets/{id}`
- **Response:** Detailed ticket metadata + activity audit trail.

### Update Ticket Status
- **Endpoint:** `PATCH /api/tickets/{id}/status`
- **Access:** `SUPPORT_AGENT`, `ADMINISTRATOR`
- **Request Body:** `{"status": "IN_PROGRESS"}`

### Assign Ticket to Agent
- **Endpoint:** `PATCH /api/tickets/{id}/assign`
- **Access:** `SUPPORT_AGENT`, `ADMINISTRATOR`
- **Request Body:** `{"agentId": "22222222-2222-2222-2222-222222222222"}`

### Dashboard Statistics
- **Endpoint:** `GET /api/dashboard/stats`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalTickets": 12,
      "openTickets": 4,
      "inProgressTickets": 5,
      "resolvedTickets": 2,
      "closedTickets": 1,
      "priorityDistribution": { "LOW": 2, "MEDIUM": 5, "HIGH": 3, "CRITICAL": 2 },
      "recentTickets": [...]
    }
  }
  ```

---

## 3. Communication & Comments (.NET 8 ASP.NET Core)

### List Comments for Ticket
- **Endpoint:** `GET /api/tickets/{ticketId}/comments`
- **Header:** `Authorization: Bearer <token>`
- **Routing:** Forwarded by Nginx to `.NET Comment Service (Port 8081)`
- **Behavior:** Verifies ticket access via Java service before returning comments.

### Post New Comment
- **Endpoint:** `POST /api/tickets/{ticketId}/comments`
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "comment": "Replaced network cable and reset IP configuration."
  }
  ```
- **Response:** `201 Created`

---

## 4. Attachment Management (Python 3.12 FastAPI)

### Request Presigned S3 Upload URL
- **Endpoint:** `POST /api/tickets/{ticketId}/attachments/presign`
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "filename": "error-log.txt",
    "content_type": "text/plain",
    "file_size": 102400
  }
  ```
- **Response:** `200 OK` (Returns presigned S3 PUT URL valid for 15 minutes)

### Confirm Upload Completion
- **Endpoint:** `POST /api/tickets/{ticketId}/attachments/complete`
- **Request Body:** `{"attachment_id": "<uuid>"}`

### Direct Upload (Local Development Mode)
- **Endpoint:** `POST /api/tickets/{ticketId}/attachments/upload`
- **Multipart Form:** `file: <binary-content>`

### List Attachments
- **Endpoint:** `GET /api/tickets/{ticketId}/attachments`

### Download Attachment
- **Endpoint:** `GET /api/attachments/{id}/download`
- **Behavior:** In AWS production, generates a presigned S3 GET URL. In local mode, streams file from local storage.

---

## 5. Microservice Health Endpoints
- **Gateway Health:** `GET http://<host>/health`
- **Java Health:** `GET http://<host>:8080/actuator/health`
- **.NET Health:** `GET http://<host>:8081/health`
- **Python Health:** `GET http://<host>:8082/health`
