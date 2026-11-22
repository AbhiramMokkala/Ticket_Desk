# Network Module: Cost-optimized VPC with isolated private RDS subnets and public EC2 subnet

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment}-ticketdesk-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.environment}-ticketdesk-igw"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Public Subnet for EC2 Application Host
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1) # 10.0.1.0/24
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-ticketdesk-public-subnet"
    Tier = "Public"
  }
}

# Public Route Table routed to Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.environment}-ticketdesk-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Private Subnets for Amazon RDS (Strictly Isolated - No NAT Gateway required for cost efficiency)
resource "aws_subnet" "database_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 10) # 10.0.10.0/24
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "${var.environment}-ticketdesk-rds-subnet-a"
    Tier = "Database-Private"
  }
}

resource "aws_subnet" "database_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 11) # 10.0.11.0/24
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "${var.environment}-ticketdesk-rds-subnet-b"
    Tier = "Database-Private"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.environment}-ticketdesk-private-rt"
  }
}

resource "aws_route_table_association" "database_a" {
  subnet_id      = aws_subnet.database_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "database_b" {
  subnet_id      = aws_subnet.database_b.id
  route_table_id = aws_route_table.private.id
}

resource "aws_db_subnet_group" "rds" {
  name        = "${var.environment}-ticketdesk-rds-subnet-group"
  description = "Subnet group for private RDS PostgreSQL"
  subnet_ids  = [aws_subnet.database_a.id, aws_subnet.database_b.id]

  tags = {
    Name = "${var.environment}-ticketdesk-db-subnet-group"
  }
}
