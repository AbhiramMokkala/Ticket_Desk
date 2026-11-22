# RDS Module: Private Amazon RDS PostgreSQL 16 (Zero Public Exposure)

resource "aws_db_instance" "postgres" {
  identifier             = "${var.environment}-ticketdesk-postgres"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password

  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false

  multi_az               = false # Cost-optimized for POC (Single AZ)
  skip_final_snapshot    = true  # Required for clean terraform destroy in evaluation
  deletion_protection    = false
  backup_retention_period = 0     # Disable automated backups to eliminate snapshot storage costs

  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.environment}-ticketdesk-rds-postgresql"
  }
}
