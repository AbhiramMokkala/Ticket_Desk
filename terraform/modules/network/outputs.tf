output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "db_subnet_group_name" {
  value = aws_db_subnet_group.rds.name
}

output "database_subnet_ids" {
  value = [aws_subnet.database_a.id, aws_subnet.database_b.id]
}
