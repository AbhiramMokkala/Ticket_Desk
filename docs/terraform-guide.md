# Terraform Infrastructure Guide

The TicketDesk Terraform codebase automates 100% of the AWS cloud infrastructure required for the Virtusa POC.

---

## 1. Directory Structure

```
terraform/
├── main.tf                    # Root composition module
├── variables.tf               # Input variable declarations
├── outputs.tf                 # Output values (IPs, URLs, Arns)
├── providers.tf               # AWS Provider with default resource tags
├── versions.tf                # Required versions (Terraform >= 1.5, AWS >= 5.50)
├── terraform.tfvars.example   # Example variables file
├── backend.tf.example         # Optional S3 remote backend template
└── modules/
    ├── network/               # VPC, Public Subnet, Private DB Subnets, IGW, Route Tables
    ├── security/              # EC2 SG (80, 443), RDS SG (5432 from EC2 strictly)
    ├── iam/                   # EC2 Instance Profile (SSM, S3, CloudWatch), Lambda Role
    ├── ec2/                   # Amazon Linux 2023, Docker & Compose user_data, encrypted EBS
    ├── rds/                   # Amazon RDS PostgreSQL 16, multi_az=false, storage_encrypted=true
    ├── s3/                    # Private Attachment Bucket, Public Access Block, SSE, CORS
    ├── lambda/                # Python 3.12 File Processor, archive_file, S3 Event Trigger
    └── cloudwatch/            # Log Groups (/ticketdesk/app), Metrics Dashboard
```

---

## 2. Command Reference

### Initialize
```bash
terraform init
```

### Format Check
```bash
terraform fmt -check -recursive
```

### Validate
```bash
terraform validate
```

### Plan
```bash
terraform plan -var="db_password=StrongPassword2026!" \
               -var="jwt_secret=My256BitJwtSecretKey!" \
               -var="internal_service_key=MyInternalKey2026!"
```

### Apply (Provision Infrastructure)
```bash
terraform apply
```

### Destroy (Clean Teardown)
```bash
terraform destroy
```

> [!IMPORTANT]
> `terraform destroy` is fully supported and automated. The S3 module uses `force_destroy = true` and the RDS module uses `skip_final_snapshot = true` to allow complete, clean removal of all resources with zero orphaned resources.
