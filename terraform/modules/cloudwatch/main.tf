# CloudWatch Module: Structured Log Groups and POC Monitoring Dashboard

resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ticketdesk/app"
  retention_in_days = 3

  tags = {
    Name = "${var.environment}-ticketdesk-app-logs"
  }
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 3

  tags = {
    Name = "${var.environment}-ticketdesk-lambda-logs"
  }
}

# CloudWatch Metrics Dashboard
resource "aws_cloudwatch_dashboard" "operations" {
  dashboard_name = "${var.environment}-ticketdesk-operations"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", var.ec2_instance_id, { label = "EC2 CPU Utilization %" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "EC2 Application Host CPU Utilization"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", var.lambda_function_name, { label = "Invocations" }],
            [".", "Errors", ".", ".", { label = "Errors", color = "#d62728" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "Lambda S3 File Processor Activity"
        }
      }
    ]
  })
}
