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

# Lightsail instance for backend
module "lightsail" {
  source = "./modules/lightsail"
  
  project_name    = var.project_name
  environment     = var.environment
  availability_zone = var.availability_zone
  bundle_id       = var.bundle_id
  domain_name     = var.backend_domain_name != "" ? var.backend_domain_name : "api.${var.domain_name}"
  
  # Container registry configuration
  container_registry = var.container_registry
  container_image    = var.container_image
  registry_username  = var.registry_username
  registry_password  = var.registry_password
  
  # Application configuration
  supabase_url              = var.supabase_url
  supabase_anon_key         = var.supabase_anon_key
  supabase_service_role_key = var.supabase_service_role_key
  jwt_secret                = var.jwt_secret
  database_url              = var.database_url
  allowed_origins           = "https://${var.domain_name}"
  token_duration            = var.token_duration
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

# Unified CloudFront distribution for both frontend and backend
module "unified_cloudfront" {
  source = "./modules/unified-cloudfront"
  
  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  acm_certificate_arn = module.acm.certificate_arn
  
  # Backend origin configuration
  lightsail_static_ip     = module.lightsail.static_ip_address
  backend_domain_name     = var.backend_domain_name
  lightsail_https_enabled = false  # Lightsail uses HTTP internally
  
  # Optional: Add custom header for origin verification
  origin_custom_header_name  = var.origin_custom_header_name
  origin_custom_header_value = var.origin_custom_header_value
}

# Route 53 DNS configuration
module "route53" {
  source = "./modules/route53"
  
  count = var.use_route53 ? 1 : 0
  
  domain_name            = var.route53_domain_name != "" ? var.route53_domain_name : var.domain_name
  hosted_zone_id         = var.route53_hosted_zone_id
  cloudfront_domain_name = module.unified_cloudfront.distribution_domain_name
  cloudfront_zone_id     = module.unified_cloudfront.distribution_hosted_zone_id
  lightsail_static_ip    = module.lightsail.static_ip_address
  
  create_apex_record = var.create_apex_record
  subdomain         = var.subdomain
  
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}