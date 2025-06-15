output "zone_id" {
  description = "The hosted zone ID"
  value       = local.zone_id
}

output "name_servers" {
  description = "Name servers for the hosted zone"
  value       = var.hosted_zone_id != "" ? data.aws_route53_zone.main_by_id[0].name_servers : data.aws_route53_zone.main[0].name_servers
}

output "api_fqdn" {
  description = "Fully qualified domain name for the API"
  value       = aws_route53_record.api.fqdn
}

output "app_fqdn" {
  description = "Fully qualified domain name for the application"
  value = var.subdomain == "" ? (
    var.create_apex_record ? var.domain_name : "www.${var.domain_name}"
  ) : "${var.subdomain}.${var.domain_name}"
}

output "health_check_id" {
  description = "Health check ID for API endpoint"
  value       = aws_route53_health_check.api.id
}