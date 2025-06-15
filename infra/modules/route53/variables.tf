variable "domain_name" {
  description = "The root domain name (e.g., example.com)"
  type        = string
}

variable "hosted_zone_id" {
  description = "Existing Route 53 hosted zone ID (optional - if not provided, will look up by domain name)"
  type        = string
  default     = ""
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "lightsail_static_ip" {
  description = "Lightsail instance static IP address"
  type        = string
}

variable "create_apex_record" {
  description = "Whether to create A record for apex domain"
  type        = bool
  default     = true
}

variable "subdomain" {
  description = "Subdomain for the application (leave empty for apex domain)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}