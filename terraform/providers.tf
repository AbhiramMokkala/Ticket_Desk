provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "TicketDesk"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Enterprise-POC"
    }
  }
}

