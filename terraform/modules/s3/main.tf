# S3 Module: Private Attachment Bucket with Full Public Access Block, SSE, and CORS

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "attachments" {
  bucket        = "ticketdesk-attachments-${var.environment}-${random_id.bucket_suffix.hex}"
  force_destroy = true # Facilitates complete terraform destroy without manual bucket draining

  tags = {
    Name = "${var.environment}-ticketdesk-attachments"
  }
}

# Strict Block of all Public Access
resource "aws_s3_bucket_public_access_block" "public_block" {
  bucket = aws_s3_bucket.attachments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-Side Encryption (AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "sse" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bucket Versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.attachments.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CORS Configuration for Frontend Direct Uploads / Downloads
resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.attachments.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["*"] # Can be restricted to production domain in prod
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
