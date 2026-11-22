# TicketDesk Evaluation Evidence Checklist

**Last Updated:** 22 November 2026  
**AWS Deployment Status:** ✅ FULLY DEPLOYED & VERIFIED  
**Application URL:** http://13.221.172.233  
**AWS Account:** 218558211203 | **Region:** us-east-1

## Status Legend
- **[IMPLEMENTED]**: Source code created and structurally complete.
- **[LOCALLY TESTED]**: Verified working in local development environment.
- **[AWS DEPLOYED]**: Infrastructure provisioned or deployed to AWS.
- **[AWS VERIFIED]**: Verified live on AWS resources with CloudWatch evidence.

---

## Verification Matrix

| Verification Item | Evaluation Target | Status | Evidence Location |
|---|---|---|---|
| Polyglot Microservices | Java 21, .NET 8, Python 3.12 | **[AWS VERIFIED]** | 4 Docker containers healthy on EC2 `i-05a5be342c613e551` |
| Docker Containerization | Multi-stage Dockerfiles & Compose | **[AWS VERIFIED]** | `docker-compose.prod.yml` running on EC2 |
| Local Database Persistence | PostgreSQL 16 | **[AWS VERIFIED]** | RDS `poc-ticketdesk-postgres.cevc800ous4f.us-east-1.rds.amazonaws.com` |
| User Registration & Login | Employee registration & JWT issuance | **[AWS VERIFIED]** | 3 seeded users live; login tested at http://13.221.172.233 |
| Ticket Creation & Workflow | `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` | **[AWS VERIFIED]** | 4 live tickets (TKT-000001–TKT-000004) in RDS |
| Ticket Comments Thread | ASP.NET Core 8 Web API | **[AWS DEPLOYED]** | `ticketdesk-dotnet-service` healthy on port 8081 |
| Cross-Service Authorization | Internal endpoint access verification | **[AWS DEPLOYED]** | `X-Internal-Service-Key` enforced across all services |
| Attachment S3 Storage | FastAPI with S3 uploads via boto3 | **[AWS VERIFIED]** | `profile.png` (1,036,235 bytes) stored at `s3://ticketdesk-attachments-poc-ddb99b43/attachments/...` |
| Lambda S3 Event Processing | `s3:ObjectCreated:*` trigger | **[AWS VERIFIED]** | Lambda logged `TICKET_ATTACHMENT_VERIFIED` with `status: APPROVED` in CloudWatch |
| CloudWatch Audit Logs | Structured JSON audit events | **[AWS VERIFIED]** | Log Group: `/aws/lambda/poc-ticketdesk-file-processor`; event: `{"audit_event":"TICKET_ATTACHMENT_VERIFIED","status":"APPROVED"}` |
| React SaaS Dashboard | Recharts charts & KPI cards | **[AWS VERIFIED]** | Frontend healthy at http://13.221.172.233 |
| Automated Unit Tests | JUnit 5, xUnit, Pytest, Vitest | **[IMPLEMENTED]** | Test directories across all services |
| End-to-End Playwright Tests | 12 Complete User Journeys | **[IMPLEMENTED]** | `tests/e2e/ticketdesk.spec.ts` |
| Terraform Modular IaC | VPC, EC2, RDS, S3, Lambda, CloudWatch | **[AWS VERIFIED]** | 37 resources applied; `terraform plan` = 0 drift |
| AWS EC2 Hosting | Amazon Linux 2023 with Docker Compose | **[AWS VERIFIED]** | EC2 `i-05a5be342c613e551`, Public IP: `13.221.172.233`, t3.micro |
| Amazon RDS PostgreSQL | Private Subnets (No public IP) | **[AWS VERIFIED]** | `db.t3.micro`, PostgreSQL 16, in private subnets `10.0.10.0/24` & `10.0.11.0/24` |
| Amazon S3 Private Bucket | Public Access Block & Versioning enabled | **[AWS VERIFIED]** | `ticketdesk-attachments-poc-ddb99b43`, AES-256 encrypted, versioning ON |
| AWS Lambda Event Trigger | `s3:ObjectCreated:*` to Lambda Processor | **[AWS VERIFIED]** | `arn:aws:lambda:us-east-1:218558211203:function:poc-ticketdesk-file-processor` |
| CloudWatch Log Groups | Application & Lambda execution logs | **[AWS VERIFIED]** | `/ticketdesk/app`, `/aws/lambda/poc-ticketdesk-file-processor` |
| CloudWatch Dashboard | Operational metrics dashboard | **[AWS VERIFIED]** | Dashboard: `poc-ticketdesk-operations` (EC2 CPU, RDS connections, Lambda invocations) |
| AWS IAM Least Privilege | Instance Profile + Lambda Execution Role | **[AWS VERIFIED]** | No hardcoded credentials; IAM roles enforced |
| AWS SSM Session Manager | Secure instance administration (no SSH) | **[AWS VERIFIED]** | SSM used for all EC2 operations |
| GitHub Actions CI | Automated build & test pipeline | **[IMPLEMENTED]** | `.github/workflows/ci.yml` |
| GitHub Actions CD | AWS OIDC deployment to EC2 | **[IMPLEMENTED]** | `.github/workflows/deploy.yml` |
| Terraform Clean Teardown | `terraform destroy` support | **[IMPLEMENTED]** | `scripts/cleanup/destroy_aws.sh` + S3 version drain script |

---

## Live AWS Resource Inventory

| Resource | Type | Identifier |
|---|---|---|
| EC2 Instance | t3.micro | `i-05a5be342c613e551` |
| EC2 Public IP | Elastic-like | `13.221.172.233` |
| RDS Endpoint | PostgreSQL 16, db.t3.micro | `poc-ticketdesk-postgres.cevc800ous4f.us-east-1.rds.amazonaws.com:5432` |
| S3 Bucket | Private, AES-256, Versioned | `ticketdesk-attachments-poc-ddb99b43` |
| Lambda Function | Python 3.12 | `poc-ticketdesk-file-processor` |
| CloudWatch Dashboard | Ops Dashboard | `poc-ticketdesk-operations` |
| VPC CIDR | Custom VPC | `10.0.0.0/16` |
| Region | — | `us-east-1` |

---

## Live Database Evidence

```
users table       → 3 rows (admin, agent, employee)
tickets table     → 4 rows (TKT-000001 through TKT-000004)
attachments table → 2 rows (test_diagnostic.txt + profile.png, status=COMPLETED)
comments table    → 0 rows
```

---

## Lambda Audit Log Evidence (CloudWatch)

```json
{
  "audit_event": "TICKET_ATTACHMENT_VERIFIED",
  "bucket": "ticketdesk-attachments-poc-ddb99b43",
  "object_key": "attachments/.../profile.png",
  "file_size": 1036235,
  "status": "APPROVED"
}
```
Log Group: `/aws/lambda/poc-ticketdesk-file-processor`

---

## Demo Login Credentials (Live)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@ticketdesk.local` | `Admin@12345` |
| Support Agent | `agent@ticketdesk.local` | `Agent@12345` |
| Employee | `employee@ticketdesk.local` | `Employee@12345` |
