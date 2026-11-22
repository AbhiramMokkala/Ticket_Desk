# IAM Module: Least Privilege Roles for EC2 and Lambda

# 1. EC2 Instance IAM Role
resource "aws_iam_role" "ec2" {
  name = "${var.environment}-ticketdesk-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.environment}-ticketdesk-ec2-role"
  }
}

# Attach AWS SSM Managed Policy for secure console access without SSH keys
resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch Logs Policy
resource "aws_iam_policy" "ec2_cloudwatch" {
  name        = "${var.environment}-ticketdesk-ec2-cloudwatch-policy"
  description = "Policy to allow EC2 to stream application logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/ticketdesk/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.ec2_cloudwatch.arn
}

# Scoped S3 Access Policy for EC2 (read/write attachments bucket only)
resource "aws_iam_policy" "ec2_s3" {
  name        = "${var.environment}-ticketdesk-ec2-s3-policy"
  description = "Policy allowing EC2 to read and write ticket attachments"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_s3" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.ec2_s3.arn
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.environment}-ticketdesk-ec2-instance-profile"
  role = aws_iam_role.ec2.name
}

# 2. Lambda Execution IAM Role
resource "aws_iam_role" "lambda" {
  name = "${var.environment}-ticketdesk-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.environment}-ticketdesk-lambda-exec-policy"
  description = "Minimum necessary permissions for S3 event validation and CloudWatch logging"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectAttributes"
        ]
        Resource = "arn:aws:s3:::${var.s3_bucket_name}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}
