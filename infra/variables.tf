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

variable "database_url" {
  description = "Direct database connection URL"
  type        = string
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
