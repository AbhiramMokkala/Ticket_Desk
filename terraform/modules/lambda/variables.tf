variable "environment" {
  type        = string
  description = "Environment name"
}

variable "lambda_role_arn" {
  type        = string
  description = "IAM Role ARN for Lambda execution"
}

variable "s3_bucket_name" {
  type        = string
  description = "Name of the S3 attachments bucket"
}

variable "s3_bucket_arn" {
  type        = string
  description = "ARN of the S3 attachments bucket"
}
