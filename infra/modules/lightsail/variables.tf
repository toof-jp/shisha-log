variable "project_name" {
  description = "Name of the project"
  type        = string
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
  description = "Domain name for the application"
  type        = string
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

variable "allowed_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "*"
}

variable "token_duration" {
  description = "JWT token expiration duration"
  type        = string
  default     = "24h"
}

variable "container_registry" {
  description = "External container registry URL"
  type        = string
}

variable "container_image" {
  description = "Container image name and tag"
  type        = string
}

variable "registry_username" {
  description = "Container registry username"
  type        = string
  sensitive   = true
}

variable "registry_password" {
  description = "Container registry password"
  type        = string
  sensitive   = true
}