output "ec2_public_ip" {
  description = "Public IPv4 address of the TicketDesk EC2 instance"
  value       = module.ec2.public_ip
}

output "application_url" {
  description = "HTTP URL to access the deployed TicketDesk Web Application"
  value       = "http://${module.ec2.public_ip}"
}

output "rds_endpoint" {
  description = "Private PostgreSQL database connection endpoint"
  value       = module.rds.db_endpoint
  sensitive   = false
}

output "s3_attachment_bucket" {
  description = "Private S3 bucket name for ticket attachments"
  value       = module.s3.bucket_name
}

output "lambda_processor_arn" {
  description = "ARN of the AWS Lambda File Processor function"
  value       = module.lambda.function_arn
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for application logging"
  value       = module.cloudwatch.app_log_group_name
}
