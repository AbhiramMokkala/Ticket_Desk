# TicketDesk â€” System Architecture & Workflow

## 1. System Overview

TicketDesk implements a polyglot microservice architecture orchestrated via Docker Compose and fronted by an Nginx reverse proxy. The architecture separates domain concerns while preserving a unified API origin for the browser client.

```mermaid
graph TD
    subgraph "Client Layer"
        Browser[Modern Web Browser / Single Page App]
    end

    subgraph "Edge / Gateway Layer"
        Nginx[Nginx Reverse Proxy Gateway<br/>Port 80 / 443]
    end

    subgraph "Microservices Layer"
        Java[Java Spring Boot 3 Ticket Service<br/>Port 8080<br/>â€¢ Auth & JWT Issuance<br/>â€¢ User Roles & RBAC<br/>â€¢ Ticket CRUD & Status<br/>â€¢ Activity Audit Trail<br/>â€¢ Dashboard Analytics]
        DotNet[.NET 8 ASP.NET Core Comment Service<br/>Port 8081<br/>â€¢ Ticket Comments & Threads<br/>â€¢ Comment Authorization]
        Python[Python 3.12 FastAPI Attachment Service<br/>Port 8082<br/>â€¢ Attachment Metadata<br/>â€¢ Presigned S3 URLs<br/>â€¢ MIME & Size Validation]
    end

    subgraph "Data & Storage Layer"
        RDS[(Amazon RDS PostgreSQL 16<br/>Private Subnets)]
        S3[(Amazon S3 Private Bucket<br/>Attachments)]
    end

    subgraph "Asynchronous Event Processing"
        Lambda[AWS Lambda File Processor<br/>Python 3.12]
        CloudWatch[Amazon CloudWatch Logs]
    end

    Browser -->|HTTP Requests| Nginx
    Nginx -->|/api/auth/*<br/>/api/tickets/*<br/>/api/dashboard/*<br/>/api/users/*| Java
    Nginx -->|"/api/tickets/:id/comments"| DotNet
    Nginx -->|"/api/tickets/:id/attachments, /api/attachments"| Python

    DotNet -.->|Internal Authorization Check<br/>X-Internal-Service-Key| Java
    Python -.->|Internal Authorization Check<br/>X-Internal-Service-Key| Java

    Java -->|Schema Ownership: users, tickets, ticket_activity| RDS
    DotNet -->|Schema Ownership: ticket_comments| RDS
    Python -->|Schema Ownership: ticket_attachments| RDS

    Python -->|Presigned PUT / GET URLs| S3
    S3 -->|s3:ObjectCreated:*| Lambda
    Lambda -->|Structured JSON Logs| CloudWatch
```

---

## 2. Cross-Service Communication & Authorization

### The Problem
A user possessing a valid JWT signed by the system must not automatically be able to read or comment on arbitrary tickets. Employees must only access tickets they authored.

### The Solution: Internal Service Verification
1. When a request reaches the **.NET Comment Service** (`GET/POST /api/tickets/{id}/comments`) or **Python Attachment Service** (`GET/POST /api/tickets/{id}/attachments/*`):
2. The service decodes the JWT bearer token, extracting the `userId` and `role`.
3. If the role is `ADMINISTRATOR` or `SUPPORT_AGENT`, access is granted based on operational scope.
4. If the role is `EMPLOYEE`, the service initiates a secure, synchronous HTTP call to the **Java Ticket Service**:
   ```http
   GET /api/internal/tickets/{ticketId}/verify-access?userId={userId}
   X-Internal-Service-Key: TicketDeskInternalServiceAuthSecret2026!
   ```
5. The Java service checks the canonical ticket record in PostgreSQL and returns:
   ```json
   {
     "ticketId": "44444444-4444-4444-4444-444444444441",
     "canAccess": true,
     "role": "EMPLOYEE",
     "isOwner": true,
     "isAssigned": false,
     "reason": "Access granted"
   }
   ```
6. If `canAccess` is `false`, the microservice returns `HTTP 403 Forbidden`. The browser never passes an untrusted user ID or bypasses the check.

---

## 3. Asynchronous File Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / Agent
    participant Web as React Frontend
    participant Py as Python Attachment Service
    participant S3 as Amazon S3 Bucket
    participant Lambda as AWS Lambda File Processor
    participant CW as CloudWatch Logs

    User->>Web: Selects screenshot.png (2.5 MB)
    Web->>Py: POST /api/tickets/{id}/attachments/presign
    Py->>Py: Verify ticket access & MIME/size limits
    Py->>S3: Generate Presigned PUT URL (15 min expiry)
    Py-->>Web: Returns upload URL & unique object_key
    Web->>S3: PUT /attachments/{id}/{uuid}_screenshot.png (Direct S3 Upload)
    S3-->>Web: 200 OK (Uploaded)
    Web->>Py: POST /api/tickets/{id}/attachments/complete
    Py->>S3: head_object (Verifies presence & size)
    Py-->>Web: Confirmed (COMPLETED)
    
    Note over S3,Lambda: Asynchronous Event Notification
    S3->>Lambda: s3:ObjectCreated:Put Notification
    Lambda->>Lambda: Parse record & validate prefix
    Lambda->>S3: head_object (Extract metadata)
    Lambda->>CW: Structured JSON log: TICKET_ATTACHMENT_VERIFIED
```

