terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Use existing hosted zone - either by ID or by name lookup
data "aws_route53_zone" "main" {
  count        = var.hosted_zone_id == "" ? 1 : 0
  name         = "${var.domain_name}."  # Add trailing dot for exact match
  private_zone = false
}

data "aws_route53_zone" "main_by_id" {
  count   = var.hosted_zone_id != "" ? 1 : 0
  zone_id = var.hosted_zone_id
}

locals {
  zone_id = var.hosted_zone_id != "" ? data.aws_route53_zone.main_by_id[0].zone_id : data.aws_route53_zone.main[0].zone_id
  zone_name = var.hosted_zone_id != "" ? data.aws_route53_zone.main_by_id[0].name : data.aws_route53_zone.main[0].name
}

# A record for apex domain pointing to CloudFront
resource "aws_route53_record" "apex" {
  count = var.create_apex_record && var.subdomain == "" ? 1 : 0

  zone_id = local.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

# CNAME record for www pointing to CloudFront
resource "aws_route53_record" "www" {
  count = var.subdomain == "" ? 1 : 0

  zone_id = local.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.cloudfront_domain_name]
}

# A record for subdomain pointing to CloudFront
resource "aws_route53_record" "subdomain" {
  count = var.subdomain != "" ? 1 : 0

  zone_id = local.zone_id
  name    = "${var.subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}
