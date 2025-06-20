# S3 bucket for storing database backups
resource "aws_s3_bucket" "backup" {
  bucket = "${var.project_name}-${var.environment}-db-backups"

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-backups"
    Project     = var.project_name
    Environment = var.environment
  }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "backup" {
  bucket = aws_s3_bucket.backup.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket lifecycle policy to delete old backups
resource "aws_s3_bucket_lifecycle_configuration" "backup" {
  bucket = aws_s3_bucket.backup.id

  rule {
    id     = "delete-old-backups"
    status = "Enabled"

    # Delete backups older than retention days
    expiration {
      days = var.backup_retention_days
    }

    # Clean up incomplete multipart uploads
    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# S3 bucket server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "backup" {
  bucket = aws_s3_bucket.backup.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "backup" {
  bucket = aws_s3_bucket.backup.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM role for Lambda function
resource "aws_iam_role" "backup_lambda" {
  name = "${var.project_name}-${var.environment}-backup-lambda-role"

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

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# IAM policy for Lambda to access S3 and logs
resource "aws_iam_role_policy" "backup_lambda" {
  name = "${var.project_name}-${var.environment}-backup-lambda-policy"
  role = aws_iam_role.backup_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.backup.arn}/*"
      },
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
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda function for database backup
resource "aws_lambda_function" "backup" {
  filename      = "${path.module}/lambda_backup.zip"
  function_name = "${var.project_name}-${var.environment}-db-backup"
  role          = aws_iam_role.backup_lambda.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 300 # 5 minutes
  memory_size   = 512

  environment {
    variables = {
      DATABASE_URL    = var.database_url
      S3_BUCKET       = aws_s3_bucket.backup.id
      PROJECT_NAME    = var.project_name
      ENVIRONMENT     = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy.backup_lambda
  ]
}

# CloudWatch log group for Lambda
resource "aws_cloudwatch_log_group" "backup_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.backup.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# EventBridge rule for weekly backups (Monday 9 AM JST = Monday 0 AM UTC)
resource "aws_cloudwatch_event_rule" "backup_schedule" {
  name                = "${var.project_name}-${var.environment}-backup-schedule"
  description         = "Trigger database backup every Monday at 9 AM JST"
  schedule_expression = "cron(0 0 ? * MON *)" # 0:00 UTC = 9:00 JST

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# EventBridge target to invoke Lambda
resource "aws_cloudwatch_event_target" "backup_lambda" {
  rule      = aws_cloudwatch_event_rule.backup_schedule.name
  target_id = "BackupLambdaTarget"
  arn       = aws_lambda_function.backup.arn
}

# Permission for EventBridge to invoke Lambda
resource "aws_lambda_permission" "backup_schedule" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.backup_schedule.arn
}