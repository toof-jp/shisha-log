environment = "prod"
aws_region  = "ap-northeast-1"

# Lightsail configuration
availability_zone = "ap-northeast-1a"
bundle_id        = "nano_2_0"  # $3.50/month (using nano for cost optimization)

# Unified domain configuration
domain_name         = "shisha.toof.jp"
backend_domain_name = "api.shisha.toof.jp"  # Backend API domain
acm_certificate_arn = ""  # Set after creating certificate in us-east-1

# Route 53 configuration
use_route53 = true
route53_domain_name = "toof.jp"  # Root domain for hosted zone
create_apex_record = false  # Using subdomain "shisha"
subdomain = "shisha"

# Container registry configuration (AWS ECR Public)
container_registry = "public.ecr.aws"
container_image    = "public.ecr.aws/d8c4j6x0/shisha-log:latest"

# Application configuration
token_duration = "24h"

# Origin verification (optional but recommended)
origin_custom_header_value = ""  # Generate a secure random string

# Sensitive variables - set these via environment variables:
# export TF_VAR_supabase_url="your-supabase-url"
# export TF_VAR_supabase_anon_key="your-supabase-anon-key"
# export TF_VAR_supabase_service_role_key="your-supabase-service-role-key"
# export TF_VAR_jwt_secret="your-jwt-secret"
# export TF_VAR_database_url="your-database-url"
# export TF_VAR_registry_username="your-registry-username"
# export TF_VAR_registry_password="your-registry-password"
# export TF_VAR_origin_custom_header_value="your-secret-header-value"