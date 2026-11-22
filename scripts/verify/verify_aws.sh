#!/usr/bin/env bash
# Validates provisioned AWS Cloud Resources for TicketDesk POC
set -e

REGION="${AWS_REGION:-us-east-1}"

echo "=== Verifying TicketDesk AWS Infrastructure (${REGION}) ==="

# 1. Verify EC2 Instance
echo "Checking EC2 Application Host..."
INSTANCE_STATE=$(aws ec2 describe-instances \
    --filters "Name=tag:Project,Values=TicketDesk" "Name=instance-state-name,Values=running" \
    --query "Reservations[0].Instances[0].State.Name" \
    --output text --region "${REGION}" || echo "NOT_FOUND")

echo "  EC2 State: ${INSTANCE_STATE}"

# 2. Verify Private RDS
echo "Checking Amazon RDS PostgreSQL..."
RDS_STATUS=$(aws rds describe-db-instances \
    --db-instance-identifier "poc-ticketdesk-postgres" \
    --query "DBInstances[0].DBInstanceStatus" \
    --output text --region "${REGION}" || echo "NOT_FOUND")

echo "  RDS Status: ${RDS_STATUS}"

# 3. Verify S3 Attachment Bucket
echo "Checking S3 Private Bucket..."
aws s3 ls | grep ticketdesk-attachments || echo "  No ticketdesk buckets found."

# 4. Verify Lambda Function
echo "Checking AWS Lambda File Processor..."
LAMBDA_STATE=$(aws lambda get-function \
    --function-name "poc-ticketdesk-file-processor" \
    --query "Configuration.State" \
    --output text --region "${REGION}" || echo "NOT_FOUND")

echo "  Lambda State: ${LAMBDA_STATE}"

echo "=== AWS Resource Verification Complete ==="
