terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Local values for certificate lookup
locals {
  # Try to lookup existing certificate
  existing_cert = var.create_certificate ? try(
    data.aws_acm_certificate.existing[0],
    null
  ) : null
  
  # Determine if we need to create a new certificate
  should_create_cert = var.create_certificate && local.existing_cert == null
  
  # Final certificate ARN to use
  certificate_arn = var.create_certificate ? (
    local.should_create_cert ? (
      length(aws_acm_certificate_validation.cert) > 0 ? aws_acm_certificate_validation.cert[0].certificate_arn : ""
    ) : local.existing_cert.arn
  ) : var.existing_certificate_arn
}

# Try to find existing certificate
data "aws_acm_certificate" "existing" {
  count = var.create_certificate ? 1 : 0
  
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
  
  # This will only return results if a certificate exists
  # If no certificate exists, the data source returns empty
}

# Create certificate only if it doesn't exist
resource "aws_acm_certificate" "cert" {
  count = local.should_create_cert ? 1 : 0

  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  tags = merge(
    var.tags,
    {
      ManagedBy = "terraform"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation records
resource "aws_route53_record" "validation" {
  for_each = local.should_create_cert && length(aws_acm_certificate.cert) > 0 ? {
    for dvo in aws_acm_certificate.cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.hosted_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "cert" {
  count = local.should_create_cert && length(aws_acm_certificate.cert) > 0 ? 1 : 0

  certificate_arn         = aws_acm_certificate.cert[0].arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]
}