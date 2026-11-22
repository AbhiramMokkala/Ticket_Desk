# PostgreSQL Database Schema & Ownership Model

## 1. Database Architecture & Table Ownership

To prevent schema conflicts and enforce domain isolation, each microservice has explicit ownership over specific relational tables within PostgreSQL 16:

| Table Name | Owner Microservice | Primary Key | Description |
|---|---|---|---|
| `users` | **Java Spring Boot** | `UUID` | User accounts, credentials, and roles |
| `tickets` | **Java Spring Boot** | `UUID` | Primary support issue metadata |
| `ticket_activity` | **Java Spring Boot** | `UUID` | Historical workflow audit events |
| `ticket_comments` | **.NET 8 ASP.NET Core** | `UUID` | Ticket discussion thread and comments |
| `ticket_attachments` | **Python 3.12 FastAPI** | `UUID` | S3 object keys and file metadata |

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ tickets : "creates"
    users ||--o{ tickets : "assigned_to"
    users ||--o{ ticket_activity : "performs"
    users ||--o{ ticket_comments : "authors"
    users ||--o{ ticket_attachments : "uploads"

    tickets ||--o{ ticket_activity : "has"
    tickets ||--o{ ticket_comments : "contains"
    tickets ||--o{ ticket_attachments : "stores"

    users {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role
        timestamptz created_at
        timestamptz updated_at
    }

    tickets {
        uuid id PK
        varchar ticket_number UK
        varchar subject
        text description
        varchar category
        varchar priority
        varchar status
        uuid created_by FK
        uuid assigned_to FK
        timestamptz created_at
        timestamptz updated_at
    }

    ticket_activity {
        uuid id PK
        uuid ticket_id FK
        varchar action
        varchar old_value
        varchar new_value
        uuid performed_by FK
        timestamptz created_at
    }

    ticket_comments {
        uuid id PK
        uuid ticket_id FK
        uuid user_id FK
        text comment
        timestamptz created_at
    }

    ticket_attachments {
        uuid id PK
        uuid ticket_id FK
        uuid uploaded_by FK
        varchar original_filename
        varchar object_key
        varchar content_type
        bigint file_size
        varchar upload_status
        timestamptz created_at
    }
```

---

## 3. Migration Strategy (Flyway)

Flyway manages schema versioning in `backend/java-ticket-service/src/main/resources/db/migration`:
- **`V1__init_schema.sql`:** Creates all base tables with indexes and constraints.
- Automatic migration executes safely at container startup before application traffic is accepted.
- In production, Flyway validates schema hashes and prevents destructive manual alterations.
