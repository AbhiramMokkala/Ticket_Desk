variable "aws_region" {
  type        = string
  description = "Target AWS Region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "poc"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the TicketDesk VPC"
  default     = "10.0.0.0/16"
}

variable "ec2_instance_type" {
  type        = string
  description = "EC2 instance size for Docker Compose host (Free Tier eligible: t3.micro)"
  default     = "t3.micro"
}

variable "ec2_key_name" {
  type        = string
  description = "Optional EC2 Key Pair for SSH access (SSM Session Manager preferred)"
  default     = null
}

variable "allowed_admin_cidrs" {
  type        = list(string)
  description = "IP CIDR ranges allowed for administrative ingress (SSH/HTTP testing)"
  default     = ["0.0.0.0/0"]
}

variable "rds_instance_class" {
  type        = string
  description = "RDS PostgreSQL DB instance class (Free Tier eligible: db.t3.micro or db.t4g.micro)"
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  type        = number
  description = "Allocated storage for RDS in GB"
  default     = 20
}

variable "db_name" {
  type        = string
  description = "PostgreSQL Database name"
  default     = "ticketdesk_db"
}

variable "db_username" {
  type        = string
  description = "Master username for RDS PostgreSQL"
  default     = "ticketdesk_admin"
}

variable "db_password" {
  type        = string
  description = "Master password for RDS PostgreSQL (Never commit plain values)"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "Shared JWT Secret Key (HMAC-SHA256)"
  sensitive   = true
}

variable "internal_service_key" {
  type        = string
  description = "Secret key for internal microservice communication"
  sensitive   = true
}
