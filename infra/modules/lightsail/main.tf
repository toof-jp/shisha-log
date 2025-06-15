# Lightsail instance
# Note: SSL certificates are automatically obtained from BuyPass Go SSL
# instead of Let's Encrypt to avoid rate limiting issues
resource "aws_lightsail_instance" "main" {
  name              = "${var.project_name}-${var.environment}"
  availability_zone = var.availability_zone
  blueprint_id      = "ubuntu_22_04"
  bundle_id         = var.bundle_id
  
  user_data = templatefile("${path.module}/user_data.sh", {
    environment           = var.environment
    domain_name           = var.domain_name
    supabase_url          = var.supabase_url
    supabase_anon_key     = var.supabase_anon_key
    supabase_service_role_key = var.supabase_service_role_key
    jwt_secret            = var.jwt_secret
    database_url          = var.database_url
    allowed_origins       = var.allowed_origins
    token_duration        = var.token_duration
    container_registry    = var.container_registry
    container_image       = var.container_image
    registry_username     = var.registry_username
    registry_password     = var.registry_password
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}"
    Environment = var.environment
  }
}

# Static IP
resource "aws_lightsail_static_ip" "main" {
  name = "${var.project_name}-${var.environment}-static-ip"
}

# Attach static IP to instance
resource "aws_lightsail_static_ip_attachment" "main" {
  static_ip_name = aws_lightsail_static_ip.main.name
  instance_name  = aws_lightsail_instance.main.name
  
  depends_on = [
    aws_lightsail_instance.main,
    aws_lightsail_static_ip.main
  ]
  
  # Force recreation when instance changes
  lifecycle {
    replace_triggered_by = [
      aws_lightsail_instance.main
    ]
  }
}

# Open necessary ports
resource "aws_lightsail_instance_public_ports" "main" {
  instance_name = aws_lightsail_instance.main.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = ["0.0.0.0/0"]
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]
  }
  
  depends_on = [
    aws_lightsail_static_ip_attachment.main
  ]
}