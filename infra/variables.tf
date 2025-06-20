variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "shisha-log"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "availability_zone" {
  description = "Availability zone for Lightsail instance"
  type        = string
  default     = "ap-northeast-1a"
}

variable "bundle_id" {
  description = "Lightsail instance bundle ID"
  type        = string
  default     = "nano_2_0"  # $3.50/month
}

variable "domain_name" {
  description = "Domain name for the application (e.g., shisha.example.com)"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain (must be in us-east-1)"
  type        = string
  default     = ""
}

variable "create_acm_certificate" {
  description = "Whether to create a new ACM certificate or use an existing one"
  type        = bool
  default     = true
}

variable "container_registry" {
  description = "External container registry URL (e.g., registry.hub.docker.com, ghcr.io)"
  type        = string
}

variable "container_image" {
  description = "Container image name and tag (e.g., username/shisha-log:latest)"
  type        = string
}

variable "registry_username" {
  description = "Container registry username"
  type        = string
  sensitive   = true
}

variable "registry_password" {
  description = "Container registry password or token"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for token validation"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Direct database connection URL"
  type        = string
  sensitive   = true
}

variable "token_duration" {
  description = "JWT token expiration duration"
  type        = string
  default     = "24h"
}

variable "api_base_url" {
  description = "Base URL for the API (used by frontend)"
  type        = string
  default     = ""
}

variable "origin_custom_header_name" {
  description = "Custom header name for CloudFront origin verification"
  type        = string
  default     = "X-CloudFront-Secret"
}

variable "origin_custom_header_value" {
  description = "Custom header value for CloudFront origin verification"
  type        = string
  default     = ""
  sensitive   = true
}

variable "backend_domain_name" {
  description = "Domain name for backend API (e.g., api.example.com)"
  type        = string
  default     = ""
}

variable "use_route53" {
  description = "Whether to use Route 53 for DNS management"
  type        = bool
  default     = true
}

variable "route53_domain_name" {
  description = "Root domain name for Route 53 hosted zone (e.g., example.com)"
  type        = string
  default     = ""
}

variable "create_apex_record" {
  description = "Whether to create A record for apex domain in Route 53"
  type        = bool
  default     = true
}

variable "subdomain" {
  description = "Subdomain for the application (leave empty for apex domain)"
  type        = string
  default     = ""
}

variable "route53_hosted_zone_id" {
  description = "Existing Route 53 hosted zone ID (optional - if not provided, will look up by domain name)"
  type        = string
  default     = ""
}

variable "backup_retention_days" {
  description = "Number of days to retain database backups in S3"
  type        = number
  default     = 30
}