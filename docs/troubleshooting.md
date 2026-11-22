# Troubleshooting Guide

Common issues, diagnostics, and remediation procedures for TicketDesk.

---

## 1. Local Development Issues

### Issue: Port 80 or 5432 Already in Use
- **Symptom:** Docker Compose fails with `bind: address already in use`.
- **Solution:** Another application (such as IIS, Apache, or a local Postgres service) is using port 80 or 5432. Stop the conflicting local process or adjust port mappings in `.env` (e.g., `NGINX_PORT=8080`).

### Issue: Containers Exit Immediately
- **Diagnostics:** Inspect container exit logs:
  ```bash
  docker compose logs java-ticket-service
  docker compose logs dotnet-comment-service
  ```
- **Solution:** Verify that PostgreSQL has completed initialization (`pg_isready`). The `docker-compose.yml` uses healthchecks to sequence startup automatically.

---

## 2. Microservice Integration Issues

### Issue: .NET Comments Return HTTP 403 Forbidden
- **Root Cause:** The authenticated user has the `EMPLOYEE` role and does not own the requested ticket.
- **Solution:** This is intentional security behavior. Only the ticket author or a Support Agent/Administrator can view and post comments on a ticket.

### Issue: S3 Attachment Upload Fails Locally
- **Root Cause:** In local mode, `STORAGE_PROVIDER` should be set to `local`.
- **Solution:** Ensure `.env` contains `STORAGE_PROVIDER=local` and the volume `/data/attachments` is mounted.

---

## 3. AWS Deployment Issues

### Issue: EC2 Cannot Connect to RDS PostgreSQL
- **Diagnostics:** Connect to EC2 via SSM Session Manager and test connectivity:
  ```bash
  nc -zv <RDS-ENDPOINT> 5432
  ```
- **Solution:**
  1. Confirm the RDS Security Group allows inbound port 5432 from the EC2 Security Group ID.
  2. Confirm both subnets in the RDS Subnet Group are in the same VPC as the EC2 instance.

### Issue: CloudWatch Logs Not Appearing
- **Root Cause:** The EC2 IAM instance profile is missing permissions or CloudWatch agent is not running.
- **Solution:** Confirm the IAM role has `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore` and the scoped CloudWatch logging policy defined in `terraform/modules/iam/main.tf`.
