# =================================================================
# Project TicketDesk — Complete AWS Infrastructure as Code
# =================================================================

# 1. Networking (VPC, Public Subnet for EC2, Private Subnets for RDS)
module "network" {
  source      = "./modules/network"
  vpc_cidr    = var.vpc_cidr
  environment = var.environment
}

# 2. S3 Attachment Bucket (Private, SSE-S3, Versioning, CORS)
module "s3" {
  source      = "./modules/s3"
  environment = var.environment
}

# 3. Security Groups (EC2: 80, 443; RDS: 5432 strictly from EC2 SG)
module "security" {
  source              = "./modules/security"
  vpc_id              = module.network.vpc_id
  environment         = var.environment
  allowed_admin_cidrs = var.allowed_admin_cidrs
}

# 4. IAM Roles & Least-Privilege Policies
module "iam" {
  source         = "./modules/iam"
  environment    = var.environment
  s3_bucket_name = module.s3.bucket_name
}

# 5. EC2 Application Host (Docker Compose on Amazon Linux 2023)
module "ec2" {
  source                = "./modules/ec2"
  environment           = var.environment
  instance_type         = var.ec2_instance_type
  subnet_id             = module.network.public_subnet_id
  security_group_id     = module.security.ec2_security_group_id
  instance_profile_name = module.iam.ec2_instance_profile_name
  key_name              = var.ec2_key_name
}

# 6. Private Amazon RDS PostgreSQL 16
module "rds" {
  source               = "./modules/rds"
  environment          = var.environment
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = var.db_password
  db_subnet_group_name = module.network.db_subnet_group_name
  security_group_id    = module.security.rds_security_group_id
}

# 7. AWS Lambda S3 Event File Processor
module "lambda" {
  source          = "./modules/lambda"
  environment     = var.environment
  lambda_role_arn = module.iam.lambda_role_arn
  s3_bucket_name  = module.s3.bucket_name
  s3_bucket_arn   = module.s3.bucket_arn
}

# 8. CloudWatch Monitoring & Log Groups
module "cloudwatch" {
  source               = "./modules/cloudwatch"
  environment          = var.environment
  aws_region           = var.aws_region
  ec2_instance_id      = module.ec2.instance_id
  lambda_function_name = module.lambda.function_name
}
