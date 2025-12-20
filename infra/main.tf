terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Provider for ACM certificates (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ACM Certificate management
module "acm" {
  source = "./modules/acm"
  
  providers = {
    aws = aws.us_east_1
  }
  
  domain_name               = var.domain_name
  subject_alternative_names = compact([
    var.backend_domain_name != "" ? var.backend_domain_name : "api.${var.domain_name}",
    "www.${var.domain_name}"
  ])
  hosted_zone_id            = var.route53_hosted_zone_id
  create_certificate        = var.create_acm_certificate
  existing_certificate_arn  = var.acm_certificate_arn
  
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# CloudFront distribution for frontend only
module "frontend_cloudfront" {
  source = "./modules/frontend-cloudfront"
  
  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  acm_certificate_arn = module.acm.certificate_arn
}

# Route 53 DNS configuration
module "route53" {
  source = "./modules/route53"
  
  count = var.use_route53 ? 1 : 0
  
  domain_name            = var.route53_domain_name != "" ? var.route53_domain_name : var.domain_name
  hosted_zone_id         = var.route53_hosted_zone_id
  cloudfront_domain_name = module.frontend_cloudfront.cloudfront_domain_name
  cloudfront_zone_id     = "Z2FDTNDATAQYW2"  # CloudFront's hosted zone ID
  
  create_apex_record = var.create_apex_record
  subdomain         = var.subdomain
}

# Database backup configuration
module "backup" {
  source = "./modules/backup"
  
  project_name          = var.project_name
  environment           = var.environment
  database_url          = var.database_url
  backup_retention_days = var.backup_retention_days
}
