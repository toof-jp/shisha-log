output "lightsail_instance_name" {
  description = "Name of the Lightsail instance"
  value       = module.lightsail.instance_name
}

output "lightsail_static_ip" {
  description = "Static IP address of Lightsail instance"
  value       = module.lightsail.static_ip_address
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.unified_cloudfront.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.unified_cloudfront.cloudfront_domain_name
}

output "frontend_s3_bucket" {
  description = "S3 bucket name for frontend"
  value       = module.unified_cloudfront.s3_bucket_name
}

output "application_url" {
  description = "URL to access the application"
  value       = module.unified_cloudfront.cloudfront_url
}

output "dns_configuration" {
  description = "DNS configuration instructions"
  value = <<-EOT
    Configure your DNS provider with the following settings:
    
    Type: CNAME
    Name: ${replace(var.domain_name, ".${join(".", slice(split(".", var.domain_name), 1, length(split(".", var.domain_name))))}", "")}
    Value: ${module.unified_cloudfront.cloudfront_domain_name}
    
    Or if using root domain:
    Type: ALIAS (or ANAME)
    Name: @
    Value: ${module.unified_cloudfront.cloudfront_domain_name}
    
    After DNS propagation, access your application at:
    - Frontend: https://${var.domain_name}
    - API: https://${var.domain_name}/api/v1
  EOT
}

output "deployment_instructions" {
  description = "Deployment instructions"
  value = <<-EOT
    Frontend deployment:
    1. cd shisha-log-frontend && npm run build
    2. aws s3 sync dist/ s3://${module.unified_cloudfront.s3_bucket_name}/ --delete
    3. aws cloudfront create-invalidation --distribution-id ${module.unified_cloudfront.cloudfront_distribution_id} --paths "/*"
    
    Backend deployment:
    1. Build and push Docker image to ${var.container_registry}
    2. Lightsail will automatically pull and deploy the new image
    
    Environment updates:
    - Frontend: VITE_API_BASE_URL=https://${var.domain_name}/api/v1
    - Backend: ALLOWED_ORIGINS=https://${var.domain_name}
  EOT
}

# Route 53 outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = var.use_route53 ? module.route53[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route 53 name servers (use these if delegating from external registrar)"
  value       = var.use_route53 ? module.route53[0].name_servers : null
}

output "route53_app_fqdn" {
  description = "Application fully qualified domain name"
  value       = var.use_route53 ? module.route53[0].app_fqdn : null
}

output "route53_api_fqdn" {
  description = "API fully qualified domain name"
  value       = var.use_route53 ? module.route53[0].api_fqdn : null
}

# ACM Certificate outputs
output "acm_certificate_arn" {
  description = "ARN of the ACM certificate being used"
  value       = module.acm.certificate_arn
}

output "acm_certificate_status" {
  description = "Status of the ACM certificate (EXISTING, ISSUED, PENDING_VALIDATION, or EXTERNAL)"
  value       = module.acm.certificate_status
}

output "acm_certificate_domains" {
  description = "Domain names covered by the certificate"
  value = {
    primary = module.acm.domain_name
    san     = compact([
      var.backend_domain_name != "" ? var.backend_domain_name : "api.${var.domain_name}",
      "www.${var.domain_name}"
    ])
  }
}