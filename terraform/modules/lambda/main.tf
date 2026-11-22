# Lambda Module: S3 Event-Triggered File Processor Function

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../aws/lambda/file-processor/lambda_function.py"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "file_processor" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-ticketdesk-file-processor"
  role             = var.lambda_role_arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.12"
  timeout          = 30
  memory_size      = 128
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      MAX_FILE_SIZE_BYTES   = "10485760" # 10MB
      ALLOWED_OBJECT_PREFIX = "attachments/"
    }
  }

  tags = {
    Name = "${var.environment}-ticketdesk-file-processor"
  }
}

# Permission for S3 to invoke Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.file_processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

# S3 Event Notification Trigger
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.s3_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.file_processor.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "attachments/"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}
