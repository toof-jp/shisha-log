environment = "prod"
aws_region  = "ap-northeast-1"

# Lightsail configuration
availability_zone = "ap-northeast-1a"
bundle_id        = "nano_2_0"  # $3.50/month (using nano for cost optimization)

# Domain configuration
domain_name = "shisha.toof.jp"

# Container registry configuration (AWS ECR Public)
container_registry = "public.ecr.aws"
container_image    = "public.ecr.aws/d8c4j6x0/shisha-log:latest"

# Application configuration
token_duration  = "24h"
api_base_url    = "https://api.shisha.toof.jp/v1"

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

# Sensitive variables - set these via environment variables:
# export TF_VAR_supabase_url="your-supabase-url"
# export TF_VAR_supabase_anon_key="your-supabase-anon-key"
# export TF_VAR_supabase_service_role_key="your-supabase-service-role-key"
# export TF_VAR_jwt_secret="your-jwt-secret"
# export TF_VAR_database_url="your-database-url"
# export TF_VAR_registry_username="your-registry-username"
# export TF_VAR_registry_password="your-registry-password"

