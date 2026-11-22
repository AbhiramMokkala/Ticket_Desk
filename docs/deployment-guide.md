# AWS EC2 Production Deployment Guide

This guide details the steps to deploy TicketDesk to a live Amazon EC2 instance provisioned by Terraform.

---

## 1. Prerequisites

1. An AWS Account with permissions to provision VPC, EC2, RDS, S3, Lambda, and IAM resources.
2. AWS CLI installed and configured (`aws configure`).
3. Terraform installed (v1.5+).

---

## 2. Deployment Steps

### Step 1: Provision Infrastructure with Terraform
```bash
cd ticketdesk/terraform

# Initialize Terraform providers
terraform init

# Review execution plan
terraform plan -out=tfplan

# Apply changes (Requires explicit confirmation)
terraform apply tfplan
```

Note the outputs:
- `ec2_public_ip`: `<EC2-PUBLIC-IP>`
- `rds_endpoint`: `<RDS-ENDPOINT>`
- `s3_attachment_bucket`: `<S3-BUCKET-NAME>`

### Step 2: Connect to EC2 via AWS Systems Manager
We recommend AWS Systems Manager Session Manager (eliminates SSH key risks):
```bash
aws ssm start-session --target <INSTANCE-ID>
```

### Step 3: Configure Production Environment on EC2
On the EC2 host:
```bash
cd /opt/ticketdesk

# Clone your repository
git clone <repository-url> .

# Create production environment file (.env.production)
cat << 'EOF' > .env.production
ENVIRONMENT=production
LOG_LEVEL=INFO

# Secrets (Match values used in Terraform)
JWT_SECRET=YourSecureJwtKeyMustBe256BitsLong!
INTERNAL_SERVICE_KEY=YourInternalAuthKey2026!

# Amazon RDS PostgreSQL Configuration
RDS_JDBC_URL=jdbc:postgresql://<RDS-ENDPOINT>:5432/ticketdesk_db
RDS_DOTNET_CONNECTION_STRING=Host=<RDS-ENDPOINT>;Port=5432;Database=ticketdesk_db;Username=ticketdesk_admin;Password=YourDbPass!
RDS_PYTHON_DATABASE_URL=postgresql://ticketdesk_admin:YourDbPass!@<RDS-ENDPOINT>:5432/ticketdesk_db
RDS_USERNAME=ticketdesk_admin
RDS_PASSWORD=YourDbPass!

# Storage Configuration (Amazon S3)
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_ATTACHMENT_BUCKET=<S3-BUCKET-NAME>
EOF
```

### Step 4: Launch Production Containers
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Step 5: Verify Deployment
Open your browser to:
`http://<EC2-PUBLIC-IP>`

Verify health endpoint:
```bash
curl http://localhost/health
```
