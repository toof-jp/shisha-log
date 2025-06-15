variable "domain_name" {
  description = "The primary domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "List of subject alternative names for the certificate"
  type        = list(string)
  default     = []
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for DNS validation"
  type        = string
}

variable "create_certificate" {
  description = "Whether to create a new certificate"
  type        = bool
  default     = true
}

variable "existing_certificate_arn" {
  description = "ARN of an existing certificate to use (if create_certificate is false)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to the certificate"
  type        = map(string)
  default     = {}
}