variable "environment" {
  type        = string
  description = "Environment name"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "ec2_instance_id" {
  type        = string
  description = "Target EC2 instance ID for monitoring"
}

variable "lambda_function_name" {
  type        = string
  description = "Target Lambda function name"
}
