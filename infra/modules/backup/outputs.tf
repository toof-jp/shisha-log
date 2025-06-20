output "backup_bucket_name" {
  description = "Name of the S3 bucket for backups"
  value       = aws_s3_bucket.backup.id
}

output "backup_bucket_arn" {
  description = "ARN of the S3 bucket for backups"
  value       = aws_s3_bucket.backup.arn
}

output "lambda_function_name" {
  description = "Name of the backup Lambda function"
  value       = aws_lambda_function.backup.function_name
}

output "lambda_function_arn" {
  description = "ARN of the backup Lambda function"
  value       = aws_lambda_function.backup.arn
}