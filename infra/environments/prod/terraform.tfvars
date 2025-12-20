environment = "prod"
aws_region  = "ap-northeast-1"

# Domain configuration
domain_name         = "shisha.toof.jp"
backend_domain_name = "api.shisha.toof.jp"

## Application configuration is now handled via Kubernetes manifests

# ACM Certificate configuration
# Option 1: Use existing certificate (set create_acm_certificate = false)
# acm_certificate_arn = "arn:aws:acm:us-east-1:571600847070:certificate/51b3c396-0fc7-4a8d-922d-cca1dde2db75"
# create_acm_certificate = false

# Option 2: Let Terraform manage the certificate (default)
create_acm_certificate = true
# If using existing certificate, uncomment the line below and set create_acm_certificate = false
# acm_certificate_arn = "arn:aws:acm:us-east-1:571600847070:certificate/51b3c396-0fc7-4a8d-922d-cca1dde2db75"

# Route53 configuration
use_route53 = true
route53_domain_name = "toof.jp"
route53_hosted_zone_id = "Z0396009800VHC1V7Z55"
create_apex_record = false
subdomain = "shisha"

# Sensitive variables - set via environment variables before running Terraform:
# export TF_VAR_database_url="your-database-url"
