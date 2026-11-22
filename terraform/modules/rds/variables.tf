variable "environment" {
  type        = string
  description = "Environment name"
}

variable "instance_class" {
  type        = string
  description = "RDS DB instance class"
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  type        = number
  description = "Allocated storage in GB"
  default     = 20
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "ticketdesk_db"
}

variable "db_username" {
  type        = string
  description = "Master DB username"
}

variable "db_password" {
  type        = string
  description = "Master DB password"
  sensitive   = true
}

variable "db_subnet_group_name" {
  type        = string
  description = "Subnet group name"
}

variable "security_group_id" {
  type        = string
  description = "Security group for RDS"
}
