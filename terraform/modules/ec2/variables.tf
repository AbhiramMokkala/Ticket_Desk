variable "instance_type" {
  type        = string
  description = "EC2 instance size"
  default     = "t3.small"
}

variable "subnet_id" {
  type        = string
  description = "Subnet ID for EC2 instance"
}

variable "security_group_id" {
  type        = string
  description = "Security Group ID for EC2"
}

variable "instance_profile_name" {
  type        = string
  description = "IAM instance profile name"
}

variable "key_name" {
  type        = string
  description = "Optional EC2 Key Pair"
  default     = null
}

variable "environment" {
  type        = string
  description = "Environment name"
}
