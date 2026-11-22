# Enterprise AWS Engineer POC Evaluation Report
## Project TicketDesk â€” IT Support Ticket Platform

**Submission Deadline:** 23 November 2026  
**Evaluation Level:** AWS Cloud Engineer / DevOps Intern  
**Project Name:** TicketDesk  
**Status:** âœ… FULLY DEPLOYED & AWS VERIFIED  
**Live Application URL:** http://13.221.172.233  
**Last Verified:** 22 November 2026

---

## 1. Project Overview
TicketDesk is an IT Support Ticket Management platform engineered to demonstrate polyglot microservice architecture, AWS cloud infrastructure deployment, database isolation, S3 event-driven computing, containerization, and automated CI/CD pipelines.

---

## 2. Architecture Diagram
Refer to detailed Mermaid diagrams in [architecture.md](file:///c:/Users/abhir/OneDrive/RASA_Implementation/ticketdesk/docs/architecture.md) and [aws-architecture.md](file:///c:/Users/abhir/OneDrive/RASA_Implementation/ticketdesk/docs/aws-architecture.md).

---

## 3. AWS Services Used
- **Amazon EC2:** Compute host running Docker Compose.
- **Amazon RDS PostgreSQL:** Relational database isolated in private subnets.
- **Amazon S3:** Private bucket for ticket documents and screenshots.
- **AWS Lambda:** Event-driven Python 3.12 function triggered by S3 uploads.
- **Amazon CloudWatch:** Structured log groups and operational metrics dashboard.
- **AWS IAM:** Least-privilege instance profile and execution roles.
- **AWS Systems Manager:** Session Manager for secure instance administration.

---

## 4. Application Flow & Workflows
- **Authentication:** Java Spring Boot validates credentials and issues JWT tokens.
- **Ticket CRUD:** Employees submit tickets (`OPEN`); Agents manage workflows (`OPEN` â†’ `IN_PROGRESS` â†’ `RESOLVED` â†’ `CLOSED`).
- **Comments Thread:** Handled by .NET 8 Web API with cross-service authorization.
- **Attachments:** Managed by Python FastAPI with S3 presigned URLs.

---

## 5. Network Architecture
- Custom VPC: `10.0.0.0/16`.
- Public Subnet: `10.0.1.0/24` (Hosts EC2 with Internet Gateway route).
- Private Database Subnets: `10.0.10.0/24` and `10.0.11.0/24` (Isolated; local traffic only).
- Security Groups: RDS permits port 5432 strictly from the EC2 security group ID.

---

## 6. Terraform Structure
Modular Infrastructure as Code in `terraform/modules`:
- `network/`, `security/`, `iam/`, `ec2/`, `rds/`, `s3/`, `lambda/`, `cloudwatch/`.
- Root configuration in `main.tf`, `variables.tf`, `outputs.tf`, `providers.tf`, and `versions.tf`.

---

## 7. Docker / Container Approach
- Multi-stage Dockerfiles for Java 21, .NET 8, Python 3.12, and React Vite Frontend.
- Nginx acts as single reverse proxy gateway on port 80.
- Docker Compose files: `docker-compose.yml` (local dev) and `docker-compose.prod.yml` (production).

---

## 8. Database Configuration
- Engine: PostgreSQL 16.
- Strict schema ownership: Java (`users`, `tickets`, `ticket_activity`), .NET (`ticket_comments`), Python (`ticket_attachments`).
- Flyway migrations in `backend/java-ticket-service/src/main/resources/db/migration`.

---

## 9. Secrets Management
- Zero passwords or AWS keys committed to source control.
- Configuration managed via environment variables and AWS IAM roles.

---

## 10. Frontend Deployment
- React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Recharts.
- Static production build served directly via Nginx.

---

## 11. Lambda Flow
- S3 `s3:ObjectCreated:*` event triggers `lambda_function.py`.
- Function verifies prefix `attachments/`, validates MIME type and file size (< 10MB), and records structured audit logs to CloudWatch.

---

## 12. CI/CD Architecture
- GitHub Actions CI (`ci.yml`): Runs JUnit, xUnit, Pytest, Vitest, and Terraform validation on pull requests.
- GitHub Actions CD (`deploy.yml`): Uses AWS OIDC to deploy updates safely to EC2 via AWS SSM.

---

## 13. CloudWatch Monitoring
- Log Groups: `/ticketdesk/app` and `/aws/lambda/poc-ticketdesk-file-processor`.
- Operational Dashboard: Tracks EC2 CPU utilization, RDS database connections, and Lambda invocations.

---

## 14. Security Implementation
- BCrypt password hashing.
- Synchronized JWT authorization across all three microservices.
- Cross-service ticket ownership checks.
- Private RDS and S3 public access blocks.

---

## 15. Cost Estimate
- Estimated at ~$37.24/month (~$8.69 for a 7-day evaluation).
- NAT Gateway avoided, saving ~$32.85/month.

---

## 16. Testing Results
- Java JUnit: Registration, login, ticket CRUD, RBAC, dashboard stats.
- .NET xUnit: Comments creation, retrieval, unauthorized access prevention.
- Python Pytest: MIME validation, size limits, local storage adapter.
- Playwright E2E: 12 end-to-end integration scenarios.

---

## 17. Deployment Steps
Detailed in [deployment-guide.md](file:///c:/Users/abhir/OneDrive/RASA_Implementation/ticketdesk/docs/deployment-guide.md).

---

## 18. Terraform Destroy Evidence
- Script: `scripts/cleanup/destroy_aws.sh`.
- Fully supported with `force_destroy = true` and `skip_final_snapshot = true`.

---

## 19. Problems Encountered and Solutions
1. *Problem:* Risk of unauthorized employees accessing comments on tickets they do not own.  
   *Solution:* Implemented internal cross-service authorization endpoint (`/api/internal/tickets/{id}/verify-access`) protected with `X-Internal-Service-Key`.
2. *Problem:* Excessive cloud cost from AWS NAT Gateways.  
   *Solution:* Designed dual-tier VPC routing where EC2 resides in a public subnet with strict security groups, allowing private RDS subnets to communicate locally without a NAT Gateway.
3. *Problem:* Local testing without active AWS credentials.  
   *Solution:* Built a dual storage adapter in Python (LocalDisk for development, S3 for production).

---

## 20. Git Repository Link
- Repository URL: `https://github.com/AbhiramMokkala/Ticket_Desk`

---

## 21. Individual Contribution Mapping
Detailed in [individual-contributions.md](file:///c:/Users/abhir/OneDrive/RASA_Implementation/ticketdesk/docs/individual-contributions.md).

