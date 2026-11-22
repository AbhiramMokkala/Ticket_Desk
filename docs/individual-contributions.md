# Individual Contribution Mapping (Cloud & DevOps Focus)

This document provides the official team member contribution matrix for the Enterprise AWS Cloud Engineer evaluation panel.

| Team Member | Role Title | Evaluation Domain | Specific Modules / AWS Resources Owned | Key Deliverables & Responsibilities |
|---|---|---|---|---|
| **M Abhiram** | Cloud Infrastructure & Network Architect | AWS Networking, RDS & Terraform Core | 	erraform/modules/network/<br>	erraform/modules/rds/<br>	erraform/main.tf | Custom VPC (10.0.0.0/16), Public & Private Subnet routing, Amazon RDS PostgreSQL 16 isolation in private subnets, Zero NAT Gateway cost-optimized architecture, Terraform state & lifecycle management. |
| **M Aditya** | Cloud Security & DevOps Lead | IAM, Security Groups & CI/CD Pipelines | 	erraform/modules/iam/<br>	erraform/modules/security/<br>.github/workflows/ | Least-privilege IAM roles, EC2 IAM Instance Profile, AWS Systems Manager (SSM) keyless management (zero open SSH ports), Security Group traffic isolation, GitHub Actions CI/CD with AWS OIDC authentication. |
| **R Tarun Teja** | Serverless, Deployment & Observability Lead | S3, Lambda, CloudWatch & EC2 Runtime | 	erraform/modules/s3/<br>	erraform/modules/lambda/<br>	erraform/modules/cloudwatch/<br>	erraform/modules/ec2/ | Amazon S3 encrypted/versioned storage, S3 ObjectCreated event-driven AWS Lambda file processor, structured CloudWatch audit logging, operational metrics dashboard (poc-ticketdesk-operations), and EC2 production container orchestration. |

---

### Evaluation Presentation & Defense Guidelines

#### 1. M Abhiram (Cloud Infrastructure & Networking)
- **Key Talking Points:**
  - Automated cloud infrastructure using modular Terraform (
etwork, ds).
  - Implemented 2-tier architecture: public tier for container gateway, private tier for database.
  - Zero NAT Gateway strategy saves ~.85/month while keeping RDS completely non-routable from the public internet.

#### 2. M Aditya (Cloud Security, IAM & CI/CD)
- **Key Talking Points:**
  - Enforced least-privilege IAM model: zero hardcoded credentials, using EC2 Instance Profile and AWS SSM.
  - Hardened network security groups: Port 5432 ingress restricted solely to EC2 Security Group ID.
  - Automated testing and deployment pipeline using GitHub Actions with AWS OIDC keyless authentication.

#### 3. R Tarun Teja (Serverless Events, Deployment & Observability)
- **Key Talking Points:**
  - Implemented event-driven file processing pipeline triggered by S3 ObjectCreated events.
  - AWS Lambda function validates attachment integrity (MIME, <10MB) and records structured audit events.
  - Constructed CloudWatch operational dashboard monitoring EC2 CPU utilization, RDS database connections, and Lambda invocations.

