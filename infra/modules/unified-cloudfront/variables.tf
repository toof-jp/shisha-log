variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for CloudFront distribution"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for custom domain (must be in us-east-1)"
  type        = string
  default     = ""
}

variable "lightsail_static_ip" {
  description = "Static IP address of the Lightsail instance"
  type        = string
}

variable "backend_domain_name" {
  description = "Domain name for backend API (e.g., api.example.com)"
  type        = string
  default     = ""
}

variable "lightsail_https_enabled" {
  description = "Whether Lightsail instance has HTTPS enabled"
  type        = bool
  default     = false
}

variable "origin_custom_header_name" {
  description = "Custom header name for origin verification"
  type        = string
  default     = ""
}

variable "origin_custom_header_value" {
  description = "Custom header value for origin verification"
  type        = string
  default     = ""
  sensitive   = true
}