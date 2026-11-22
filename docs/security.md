# TicketDesk Security Architecture & Best Practices

Security is a primary evaluation category for the Virtusa AWS Engineer POC. TicketDesk implements defense-in-depth across the application, identity, network, and cloud infrastructure layers.

---

## 1. Authentication & Password Security
- **BCrypt Password Hashing:** Passwords are never stored in plaintext. Passwords are salted and hashed using Spring Security's `BCryptPasswordEncoder` with 10 rounds of hashing.
- **Stateless JWT Tokens:** Authentication issues HMAC-SHA256 signed JSON Web Tokens (256-bit key length). Tokens contain standard claims (`sub`, `email`, `role`, `fullName`, `exp`, `iat`).
- **Synchronized Verification:** Java, .NET, and Python microservices all validate the identical secret key, issuer, and audience.
- **No Credentials in Code:** All database passwords, JWT secrets, and AWS identifiers are injected via environment variables at runtime.

---

## 2. Role-Based Access Control (RBAC)
- **Role Isolation:**
  - `EMPLOYEE`: Access strictly restricted to tickets authored by themselves. Cannot assign agents or change status.
  - `SUPPORT_AGENT`: Operational permissions to view all tickets, assign agents, update status, and add comments.
  - `ADMINISTRATOR`: Full governance rights (user role modifications, administrative overview).
- **Public Registration Guard:** The registration endpoint hardcodes `role = Role.EMPLOYEE`. Public users cannot select `ADMINISTRATOR` or `SUPPORT_AGENT`.
- **Last Administrator Protection:** The system forbids demoting or removing the final active Administrator account.

---

## 3. Cross-Service Authorization
- **The Vulnerability Avoided:** Possession of a valid JWT token does not automatically grant rights to access another user's tickets in downstream microservices.
- **The Defense Implemented:** Before reading or creating comments (.NET) or attachments (Python), microservices invoke Java's internal verification endpoint:
  ```http
  GET /api/internal/tickets/{ticketId}/verify-access?userId={userId}
  Header: X-Internal-Service-Key: <internal-secret>
  ```
  If the employee does not own the ticket, downstream operations are rejected with `HTTP 403 Forbidden`.

---

## 4. AWS Cloud Infrastructure Security
- **Private Amazon RDS:** RDS PostgreSQL is placed inside private database subnets with **no route to the Internet Gateway** and `publicly_accessible = false`. Direct external access is architecturally impossible.
- **Strict Security Group Referencing:** The RDS Security Group permits port 5432 ingress strictly from the EC2 Application Security Group ID (`source_security_group_id`).
- **Private S3 Storage:** The S3 attachment bucket enables all 4 flags of `aws_s3_bucket_public_access_block`, enables AES256 Server-Side Encryption, and generates short-lived (15 minute) presigned URLs for client uploads and downloads.
- **Least-Privilege IAM Roles:** EC2 uses an IAM instance profile rather than static AWS Access Keys. Policies are strictly scoped to the specific S3 bucket and CloudWatch log groups.
- **AWS SSM Session Manager:** Eliminates the need to open SSH port 22 to the public internet for EC2 management.
