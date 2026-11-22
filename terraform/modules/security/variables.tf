variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

variable "allowed_admin_cidrs" {
  type        = list(string)
  description = "Allowed CIDRs for HTTP/SSH"
  default     = ["0.0.0.0/0"]
}
