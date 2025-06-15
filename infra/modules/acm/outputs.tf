output "certificate_arn" {
  description = "The ARN of the ACM certificate"
  value       = local.certificate_arn
}

output "certificate_status" {
  description = "Status of the certificate"
  value = var.create_certificate ? (
    local.should_create_cert ? (
      length(aws_acm_certificate_validation.cert) > 0 ? "ISSUED" : "PENDING_VALIDATION"
    ) : "EXISTING"
  ) : "EXTERNAL"
}

output "domain_name" {
  description = "The domain name of the certificate"
  value       = var.domain_name
}

output "validation_records" {
  description = "DNS validation records that were created"
  value       = aws_route53_record.validation
  sensitive   = true
}