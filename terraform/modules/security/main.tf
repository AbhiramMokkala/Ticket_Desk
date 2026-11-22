# Security Module: EC2 Web Security Group & Restricted Private RDS Security Group

# 1. EC2 Application Security Group
resource "aws_security_group" "ec2" {
  name        = "${var.environment}-ticketdesk-ec2-sg"
  description = "Security group for TicketDesk EC2 application host"
  vpc_id      = var.vpc_id

  # HTTP Ingress
  ingress {
    description = "Allow inbound HTTP for Web UI and API"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_admin_cidrs
  }

  # HTTPS Ingress
  ingress {
    description = "Allow inbound HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_admin_cidrs
  }

  # SSH Ingress (Restricted)
  ingress {
    description = "Allow SSH from authorized CIDRs (SSM preferred)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_admin_cidrs
  }

  # Outbound All (Allows downloading containers, S3 access, package updates)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-ticketdesk-ec2-sg"
  }
}

# 2. RDS PostgreSQL Security Group (Zero public exposure)
resource "aws_security_group" "rds" {
  name        = "${var.environment}-ticketdesk-rds-sg"
  description = "Restricted security group for Amazon RDS PostgreSQL"
  vpc_id      = var.vpc_id

  # PostgreSQL strictly from EC2 application security group
  ingress {
    description     = "Allow PostgreSQL access strictly from EC2 application instances"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-ticketdesk-rds-sg"
  }
}
