# Shisha Log Backend Infrastructure - AWS Lightsail

This directory contains Terraform configurations to deploy the Shisha Log backend on AWS Lightsail with static IP and custom domain support.

## Architecture Overview

- **AWS Lightsail**: Single VPS instance with Docker
- **Static IP**: Fixed IP address for domain configuration
- **Nginx**: Reverse proxy with SSL termination
- **Let's Encrypt**: Automated SSL certificate management
- **External Registry**: Docker Hub, GitHub Container Registry, etc.
- **Supabase**: External database (not managed by this Terraform)

This cost-effective architecture provides SSL, custom domain support, and easy deployment for small to medium applications.

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform installed (>= 1.0)
3. External container registry account (Docker Hub, GHCR, etc.)
4. Domain name with DNS management access
5. Supabase project set up

## Directory Structure

```
infra/
├── main.tf                    # Root module configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── modules/
│   └── lightsail/            # Lightsail instance, static IP, ports
└── environments/
    ├── dev/                  # Development environment config
    └── prod/                 # Production environment config
```

## Setup Instructions

### 1. Container Registry Setup

#### Docker Hub (Recommended for simplicity)
```bash
# Create Docker Hub account and repository
# Repository: username/shisha-log
# Get access token from Docker Hub settings
```

#### GitHub Container Registry
```bash
# Create personal access token with packages:write permission
export DOCKER_USERNAME=your-github-username
export DOCKER_PASSWORD=your-github-token
```

### 2. Set Environment Variables

```bash
# Container registry credentials
export TF_VAR_registry_username="your-registry-username"
export TF_VAR_registry_password="your-registry-password"

# Supabase configuration
export TF_VAR_supabase_url="https://your-project.supabase.co"
export TF_VAR_supabase_anon_key="your-anon-key"
export TF_VAR_supabase_service_role_key="your-service-role-key"

# Application configuration
export TF_VAR_jwt_secret="your-very-secure-jwt-secret"
export TF_VAR_database_url="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
```

### 3. Update Terraform Variables

Edit the environment-specific `terraform.tfvars` files:
- Update `domain_name` with your actual domain
- Update `container_registry` and `container_image` with your registry details
- Adjust `bundle_id` for desired instance size

### 4. Deploy Infrastructure

```bash
cd infra

# Initialize Terraform
terraform init

# Deploy development environment
terraform workspace new dev
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars

# Get the static IP address
terraform output static_ip_address
```

### 5. Configure DNS

Configure your domain's DNS settings:
```
A Record: api-dev.shisha.toof.jp -> [STATIC_IP_ADDRESS]
```

### 6. Setup SSL Certificate

After DNS propagation (usually 5-15 minutes), SSH to the instance and run:

```bash
# SSH to the instance
ssh ubuntu@[STATIC_IP_ADDRESS]

# Setup SSL certificate
sudo certbot --nginx -d api-dev.shisha.toof.jp --non-interactive --agree-tos --email admin@shisha.toof.jp
```

## Lightsail Bundle Options

| Bundle ID | vCPUs | RAM | SSD | Transfer | Price/Month |
|-----------|-------|-----|-----|----------|-------------|
| nano_2_0  | 1     | 0.5GB | 20GB | 1TB    | $3.50      |
| micro_2_0 | 1     | 1GB   | 40GB | 2TB    | $5.00      |
| small_2_0 | 1     | 2GB   | 60GB | 3TB    | $10.00     |
| medium_2_0| 2     | 4GB   | 80GB | 4TB    | $20.00     |

## Cost Breakdown

**Development Environment (nano_2_0):**
- Lightsail Instance: $3.50/month
- Static IP: Free (included)
- SSL Certificate: Free (Let's Encrypt)
- **Total: $3.50/month**

**Production Environment (small_2_0):**
- Lightsail Instance: $10/month
- Static IP: Free (included)
- SSL Certificate: Free (Let's Encrypt)
- **Total: $10/month**

## Deployment Process

### Automatic Deployment (GitHub Actions)

1. **Infrastructure**: Manual trigger via `workflow_dispatch`
2. **Application**: Automatic on push to main/develop branches

### Manual Deployment

```bash
# SSH to instance
ssh ubuntu@[STATIC_IP_ADDRESS]

# Navigate to application directory
cd /opt/shisha-log

# Update application
./deploy.sh
```

## Monitoring and Logs

### Application Logs
```bash
# SSH to instance
ssh ubuntu@[STATIC_IP_ADDRESS]

# View application logs
cd /opt/shisha-log
docker-compose logs -f app
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# System resources
htop

# Disk usage
df -h

# Docker status
docker ps
docker stats
```

## Security Features

- **Firewall**: Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS) are open
- **SSL/TLS**: Automatic HTTPS redirect with Let's Encrypt certificates
- **Auto-renewal**: SSL certificates renew automatically via cron
- **Docker isolation**: Application runs in isolated containers
- **Nginx proxy**: Hides direct application access

## Backup and Recovery

### Database Backup
```bash
# Supabase provides automated backups
# Manual backup via Supabase dashboard or CLI
```

### Instance Snapshot
```bash
# Create snapshot via AWS CLI
aws lightsail create-instance-snapshot \
  --instance-name shisha-log-prod \
  --instance-snapshot-name shisha-log-backup-$(date +%Y%m%d)
```

## Troubleshooting

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Manual renewal
sudo certbot renew --nginx

# Check Nginx configuration
sudo nginx -t
```

### Application Issues
```bash
# Check container status
docker ps

# Restart application
cd /opt/shisha-log
docker-compose restart

# Check health endpoint
curl http://localhost:8080/health
```

### DNS Issues
```bash
# Check DNS propagation
nslookup api-dev.shisha.toof.jp
dig api-dev.shisha.toof.jp
```

## Scaling Considerations

- **Vertical Scaling**: Upgrade to larger Lightsail bundle
- **Horizontal Scaling**: Add Application Load Balancer + multiple instances
- **Database Scaling**: Supabase handles database scaling automatically
- **CDN**: Add CloudFront for global content delivery

## Cleanup

To destroy the infrastructure:

```bash
terraform destroy -var-file=environments/{environment}/terraform.tfvars
```

**Note**: This will permanently delete the instance and all data. Ensure backups are taken before destroying.