# TicketDesk — Enterprise IT Support Ticket Management Platform
### Virtusa AWS Cloud Engineer Level Proof of Concept (POC)
**Evaluation Submission Deadline:** 23 November 2026  
**Primary Focus:** AWS Cloud Engineering, Polyglot Microservices (Java 21, .NET 8, Python 3.12), Infrastructure as Code (Terraform), Containerization (Docker), CI/CD (GitHub Actions), and Robust Cloud Security.

---

## 1. Executive Summary

**TicketDesk** is a production-grade, polyglot cloud application designed for enterprise IT support management. It enables employees to log technical issues, attach diagnostic documents and screenshots, track ticket resolution workflows, and communicate directly with IT support agents. Support agents can assign tickets, transition ticket statuses, and add internal notes, while administrators can govern user accounts and monitor helpdesk metrics.

Rather than a simple classroom CRUD application, TicketDesk demonstrates an industry-standard, cost-optimized cloud architecture integrating:
- **Core API & Authentication:** Java 21 & Spring Boot 3 with Spring Security, Spring Data JPA, and Flyway.
- **Communication & Comments Service:** ASP.NET Core Web API (.NET 8) with Entity Framework Core and JWT Bearer authorization.
- **Attachment & S3 Storage Service:** Python 3.12 & FastAPI with Boto3 for private Amazon S3 presigned operations.
- **Event-Driven File Processing:** AWS Lambda (Python 3.12) triggered by S3 `ObjectCreated` events.
- **Database:** Amazon RDS PostgreSQL 16 isolated in private subnets.
- **Infrastructure as Code:** 100% automated with modular Terraform (`network`, `security`, `iam`, `ec2`, `rds`, `s3`, `lambda`, `cloudwatch`).
- **DevOps & CI/CD:** Multi-stage Docker containers, Docker Compose, Nginx reverse proxy, and GitHub Actions CI/CD with AWS OIDC authentication.

---

## 2. Microservice Architecture & Topology

```mermaid
graph TD
    User([Browser Client / React App]) -->|HTTP Port 80| Nginx[Nginx Reverse Proxy Gateway]

    subgraph "Docker Compose / Amazon EC2 Host"
        Nginx -->|/api/auth/*, /api/tickets/*, /api/dashboard/*, /api/users/*| Java[Java Ticket & Auth Service<br/>Spring Boot 3 • Port 8080]
        Nginx -->|/api/tickets/{id}/comments| DotNet[.NET Comment Service<br/>ASP.NET Core 8 • Port 8081]
        Nginx -->|/api/tickets/{id}/attachments/*, /api/attachments/*| Python[Python Attachment Service<br/>FastAPI • Port 8082]
        
        DotNet -.->|Internal Auth Verification<br/>X-Internal-Service-Key| Java
        Python -.->|Internal Auth Verification<br/>X-Internal-Service-Key| Java
    end

    subgraph "AWS Managed Cloud Infrastructure"
        Java -->|JPA / Flyway| RDS[(Amazon RDS PostgreSQL 16<br/>Private Subnets)]
        DotNet -->|EF Core| RDS
        Python -->|SQLAlchemy| RDS
        
        Python -->|Boto3 Presigned URLs| S3[Amazon S3 Private Attachment Bucket]
        S3 -->|ObjectCreated Event| Lambda[AWS Lambda File Processor]
        Lambda -->|Structured Audit Logs| CloudWatch[Amazon CloudWatch Logs]
    end
```

---

## 3. Technology Stack

| Layer | Technologies | Role / Responsibility |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts | Modern SaaS user interface, dashboards, and forms |
| **Gateway** | Nginx Alpine | Reverse proxy, static asset delivery, unified single-origin API routing |
| **Core Backend** | Java 21, Spring Boot 3.3.4, Spring Security, Flyway, Maven | JWT issuance, User RBAC, Ticket CRUD, Status workflows, Dashboard stats |
| **Comments Backend** | .NET 8 (ASP.NET Core Web API), EF Core, Npgsql, xUnit | Ticket comment threads, communication history, cross-service auth checks |
| **Attachments Backend** | Python 3.12, FastAPI, Pydantic, Boto3, Pytest | Attachment metadata, S3 presigned URLs, MIME & size validation |
| **Cloud Event Processor** | AWS Lambda (Python 3.12), Boto3 | S3 `ObjectCreated` event consumer, file validation, CloudWatch audit logging |
| **Database** | PostgreSQL 16 (Local Dockerized / Amazon RDS in AWS) | Shared relational persistence with strict table ownership |
| **Infrastructure as Code** | Terraform (AWS Provider ~> 5.50) | Modular provisioning of VPC, Subnets, SG, IAM, EC2, RDS, S3, Lambda, CloudWatch |
| **CI/CD** | GitHub Actions | Automated build, test, lint, Docker build validation, and AWS OIDC deployment |

---

## 4. User Roles & Permission Model

1. **Employee:**
   - Public registration creates Employee accounts by default.
   - Author new support tickets with optional attachments.
   - View only tickets created by themselves.
   - Post comments on their own tickets.
   - Download permitted ticket attachments.
2. **Support Agent:**
   - View all support tickets across the company.
   - Filter and search tickets by status, priority, and category.
   - Assign tickets to themselves or other agents.
   - Transition ticket status (`OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).
   - Add comments and review attachments on all tickets.
3. **Administrator:**
   - Full operational access to all tickets and workflows.
   - Access the **Administration** dashboard with system statistics.
   - View all registered users and toggle roles (`EMPLOYEE` ↔ `SUPPORT_AGENT`).
   - Protected: The system enforces that the last Administrator account cannot be demoted.

---

## 5. Quickstart — Local Development

TicketDesk can run 100% locally using Docker Compose without requiring an AWS account.

### Prerequisites
- Docker Engine & Docker Compose
- Web browser (Chrome / Edge / Firefox)

### One-Command Startup
```bash
# 1. Clone repository and navigate to ticketdesk
cd ticketdesk

# 2. Copy environment file
cp .env.example .env

# 3. Build and launch all microservices
docker compose up --build -d

# 4. Check service status
docker compose ps
```

### Accessing the Local Application
- **Web Application:** [http://localhost](http://localhost)
- **Java Health:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **.NET Health:** [http://localhost:8081/health](http://localhost:8081/health)
- **Python Health:** [http://localhost:8082/health](http://localhost:8082/health)

### Pre-Seeded Demonstration Accounts
For rapid evaluation, the login screen includes one-click preset buttons:

| Role | Email Address | Password |
|---|---|---|
| **Administrator** | `admin@ticketdesk.local` | `Admin@12345` |
| **Support Agent** | `agent@ticketdesk.local` | `Agent@12345` |
| **Employee** | `employee@ticketdesk.local` | `Employee@12345` |

---

## 6. AWS Cloud Deployment

Complete Terraform infrastructure code is located in `terraform/`.

```bash
cd terraform

# 1. Initialize Terraform
terraform init

# 2. Validate configuration
terraform validate

# 3. Create execution plan
terraform plan -var="db_password=YourSecurePassword2026!" \
               -var="jwt_secret=YourSecureJwtKeyMustBe256BitsLong!" \
               -var="internal_service_key=YourInternalAuthKey2026!"

# 4. Apply infrastructure (Requires user authorization)
terraform apply

# 5. Output displays public IP and application URL
# Destroy infrastructure when POC is completed:
terraform destroy
```

---

## 7. Automated Testing Suite

```bash
# Run Java Spring Boot JUnit & Mockito tests
cd backend/java-ticket-service && mvn clean test

# Run .NET 8 xUnit tests
cd backend/dotnet-comment-service && dotnet test

# Run Python FastAPI pytest tests
cd backend/python-attachment-service && pytest

# Run Frontend Vitest tests
cd frontend && npm test

# Run Playwright End-to-End integration tests
cd tests/e2e && npx playwright test
```

---

## 8. Repository Structure

```
ticketdesk/
├── frontend/                  # React 18, TypeScript, Vite, Tailwind CSS, Recharts
├── backend/
│   ├── java-ticket-service/   # Java 21, Spring Boot 3, Spring Security, Flyway, JPA
│   ├── dotnet-comment-service/# ASP.NET Core 8 Web API, EF Core, xUnit
│   └── python-attachment-service/ # Python 3.12, FastAPI, Boto3, Pytest
├── aws/
│   └── lambda/file-processor/ # AWS Lambda S3 event processor
├── terraform/                 # Modular Terraform (network, security, iam, ec2, rds, s3, lambda, cloudwatch)
├── nginx/                     # Gateway reverse proxy configuration
├── tests/
│   ├── e2e/                   # Playwright end-to-end test scenarios
│   └── integration/           # Microservice health & auth validation scripts
├── scripts/                   # Local setup, deploy, verify, and cleanup scripts
├── docs/                      # Architectural reports, security specs, POC report, and evidence
├── docker-compose.yml         # Local development configuration (with Postgres)
├── docker-compose.prod.yml    # Production configuration (connects to Amazon RDS)
├── Makefile                   # Developer CLI shortcuts
└── README.md                  # Main project guide
```

---

## 9. License & Submission Information
- **Organization:** Virtusa Corporation — Cloud Practice Proof of Concept (POC)
- **Target Deadline:** 23 November 2026
- **Author / Engineer:** Virtusa Cloud Engineering Intern Team
