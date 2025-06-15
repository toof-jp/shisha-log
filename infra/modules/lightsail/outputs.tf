output "instance_name" {
  description = "Name of the Lightsail instance"
  value       = aws_lightsail_instance.main.name
}

output "static_ip_address" {
  description = "Static IP address assigned to the instance"
  value       = aws_lightsail_static_ip.main.ip_address
  depends_on  = [aws_lightsail_static_ip_attachment.main]
}

output "instance_id" {
  description = "ID of the Lightsail instance"
  value       = aws_lightsail_instance.main.id
}

output "instance_arn" {
  description = "ARN of the Lightsail instance"
  value       = aws_lightsail_instance.main.arn
}