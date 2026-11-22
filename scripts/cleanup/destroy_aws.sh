#!/usr/bin/env bash
# TicketDesk Clean Teardown Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(cd "${SCRIPT_DIR}/../../terraform" && pwd)"

echo "================================================================="
echo "WARNING: This will DESTROY all AWS cloud infrastructure created for TicketDesk POC"
echo "Target directory: ${TERRAFORM_DIR}"
echo "================================================================="

read -p "Are you sure you want to proceed with terraform destroy? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Destroy canceled."
    exit 0
fi

cd "${TERRAFORM_DIR}"

echo "Running terraform destroy..."
terraform destroy -auto-approve

echo "Terraform destroy completed successfully. AWS infrastructure removed."
