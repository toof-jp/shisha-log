# Deployment Guide

This comprehensive guide covers deploying the Shisha Log application to AWS using the unified domain architecture.

## Architecture Overview

Shisha Log uses a unified domain architecture:
- **Frontend**: Served from CloudFront + S3 at `https://shisha.toof.jp`
- **Backend API**: Served through CloudFront at `https://shisha.toof.jp/v1/*`
- **DNS**: Route 53 manages the unified domain with CloudFront handling path-based routing

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform installed (>= 1.0)
- Node.js and npm installed
- Docker installed (for backend deployment)
- Domain name registered with external registrar

## Initial Setup

### 1. Environment Configuration

```bash
# Create environment file from example
make setup-env

# Edit .env with your configuration
```

Required environment variables:
```bash
# Frontend Configuration
VITE_API_BASE_URL=https://shisha.toof.jp/v1

# Backend Server Configuration  
PORT=8080
ENVIRONMENT=production
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
JWT_SECRET=<your-jwt-secret>
ALLOWED_ORIGINS=https://shisha.toof.jp,https://www.shisha.toof.jp
DATABASE_URL=<postgresql-connection-string>
TOKEN_DURATION=24h

# Frontend Deployment Configuration
S3_BUCKET_NAME=<will-be-set-after-terraform>
CLOUDFRONT_DISTRIBUTION_ID=<will-be-set-after-terraform>
ECR_ALIAS=<your-ecr-alias>
```

### 2. ECR Public Repository Setup

Create an ECR Public repository for Docker images:

```bash
make setup-ecr
```

This creates a public ECR repository and outputs the ECR alias. Add it to your `.env`:
```bash
ECR_ALIAS=571600847070  # Your actual alias from the output
```

### 3. ACM Certificate Creation (Optional for Custom Domain)

If using a custom domain instead of CloudFront default:

```bash
# Create certificate in us-east-1 (required for CloudFront)
make create-acm-cert

# Add the ARN to terraform configuration
```

## Infrastructure Deployment

### 1. Configure Terraform

Edit `infra/environments/prod/terraform-unified.tfvars`:

```hcl
# Basic configuration
project_name = "shisha-log"
environment = "prod"
region = "ap-northeast-1"

# Container image
container_image = "public.ecr.aws/YOUR_ECR_ALIAS/shisha-log:latest"

# Domain configuration
domain_name = "shisha.toof.jp"
# Backend will be accessible at shisha.toof.jp/api/*
acm_certificate_arn = "arn:aws:acm:us-east-1:xxx:certificate/xxx"

# Instance configuration
lightsail_instance_type = "small_2_0"
lightsail_availability_zone = "ap-northeast-1a"
```

### 2. Deploy Infrastructure

```bash
# Initialize Terraform
make infra-unified-init

# Plan the deployment
make infra-unified-plan

# Apply the infrastructure
make infra-unified-apply
```

After successful deployment, note the outputs:
- `s3_bucket_name`
- `cloudfront_distribution_id`
- `cloudfront_domain_name`
- `lightsail_static_ip`

### 3. Update Environment File

Add the deployment outputs to `.env`:

```bash
S3_BUCKET_NAME=shisha-log-prod-frontend
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

## DNS Configuration

### Option 1: Using Route 53 (Recommended)

1. **Configure Route 53 in Terraform**:
   ```hcl
   # In terraform-unified.tfvars
   use_route53 = true
   route53_domain_name = "example.com"
   subdomain = "shisha"
   ```

2. **Deploy infrastructure**:
   ```bash
   make infra-unified-apply
   ```

3. **Update your domain registrar** (if using external registrar):
   - Get Route 53 name servers from Terraform output
   - Update your registrar to use Route 53 name servers
   - Wait 24-48 hours for propagation

### Option 2: External DNS Provider

If not using Route 53, manually configure:
```
CNAME: shisha.example.com → [CloudFront Domain]
A: api.example.com → [Lightsail Static IP]
```

### DNS Verification

```bash
# Check DNS propagation
dig shisha.example.com
dig api.example.com

# Test with specific nameserver
dig @8.8.8.8 shisha.example.com
```

## Application Deployment

### Backend Deployment

1. Build and push Docker image:
   ```bash
   # Build the image
   make docker-build
   
   # Push to ECR Public
   make docker-push
   ```

2. The Lightsail instance will automatically:
   - Pull the Docker image
   - Start the application
   - Configure nginx proxy
   - Obtain SSL certificate via Let's Encrypt

### Frontend Deployment

```bash
# Build and deploy frontend to S3
make deploy-frontend
```

This command:
1. Builds the React application
2. Syncs files to S3
3. Invalidates CloudFront cache

## Verification

After deployment, verify:

1. **Frontend**: https://shisha.example.com
2. **API Health**: https://shisha.example.com/v1/health
3. **Swagger UI**: https://shisha.example.com/swagger/index.html

## Updating Deployments

### Frontend Updates

```bash
# After making changes
make deploy-frontend
```

### Backend Updates

```bash
# Build and push new image
make docker-build
make docker-push

# SSH into instance and restart (if needed)
ssh ubuntu@[LIGHTSAIL_IP]
sudo systemctl restart shisha-log
```

## Monitoring and Debugging

### View Logs

```bash
# SSH into Lightsail instance
ssh ubuntu@[LIGHTSAIL_IP]

# Application logs
sudo journalctl -u shisha-log -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# SSL setup logs
sudo journalctl -u setup-ssl.service
```

### Check Status

```bash
# Application status
sudo systemctl status shisha-log

# Docker container
sudo docker ps
sudo docker logs shisha-log

# SSL certificate
sudo certbot certificates
```

## Troubleshooting

### Common Issues

1. **CloudFront 403/404 Errors**
   - Verify S3 bucket policy (handled by Terraform)
   - Check CloudFront behaviors configuration
   - Ensure error pages redirect to index.html for SPA

2. **API Connection Failed**
   - Check backend ALLOWED_ORIGINS includes CloudFront domain
   - Verify Lightsail security groups allow 80/443
   - Check CloudFront API behavior configuration

3. **SSL Certificate Issues**
   - Ensure DNS records point to correct IPs
   - Check Let's Encrypt logs on Lightsail
   - For CloudFront, verify ACM certificate is in us-east-1

4. **ECR Push Failures**
   - Verify ECR_ALIAS in .env
   - Check AWS credentials
   - Ensure ECR repository exists

### Debug Commands

```bash
# Check infrastructure state
make infra-output

# Verify S3 deployment
aws s3 ls s3://[BUCKET_NAME]/

# Check CloudFront distribution
aws cloudfront get-distribution --id [DIST_ID]

# Test API health endpoint
curl -I https://shisha.example.com/v1/health

# Test root health endpoint  
curl -I https://shisha.example.com/health
```

## Cost Estimates

Monthly costs (approximate):
- **Lightsail**: $10 (small_2_0 instance)
- **CloudFront**: $0.085/GB data transfer
- **S3**: $0.023/GB storage + requests
- **ACM Certificates**: Free
- **Total**: ~$15-20 for small-scale usage

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env` files
   - Use AWS Secrets Manager for production
   - Rotate JWT secrets regularly

2. **Access Control**
   - S3 bucket is private (CloudFront OAC only)
   - Lightsail security groups restrict access
   - Use origin verification headers

3. **HTTPS Enforcement**
   - CloudFront enforces HTTPS for all requests
   - Backend uses Let's Encrypt for API subdomain
   - HTTP automatically redirects to HTTPS

## Rollback Procedures

If deployment fails:

```bash
# Rollback infrastructure changes
cd infra && terraform apply -var-file=environments/prod/terraform-unified.tfvars -refresh=true

# Restore previous frontend (S3 versioning enabled)
# Use AWS Console to restore previous version

# Rollback backend
# Deploy previous Docker image tag
docker push public.ecr.aws/$ECR_ALIAS/shisha-log:previous-tag
ssh ubuntu@[LIGHTSAIL_IP]
sudo docker pull public.ecr.aws/$ECR_ALIAS/shisha-log:previous-tag
sudo systemctl restart shisha-log
```

## Cleanup

To destroy all infrastructure:

```bash
# WARNING: This deletes everything permanently
make infra-unified-destroy
```

## CI/CD Setup (GitHub Actions)

### AWS Credentials for GitHub Actions

1. **Create IAM User**:
   ```bash
   # Create user
   aws iam create-user --user-name github-actions-shisha-log
   
   # Create access key
   aws iam create-access-key --user-name github-actions-shisha-log
   ```

2. **Attach Policy**:
   ```bash
   # Create policy
   aws iam create-policy \
     --policy-name GitHubActionsShishaLogPolicy \
     --policy-document file://infra/github-actions-policy.json
   
   # Attach policy
   aws iam attach-user-policy \
     --user-name github-actions-shisha-log \
     --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitHubActionsShishaLogPolicy
   ```

3. **Get AWS Account ID**:
   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

### Required GitHub Secrets

Add these secrets to your repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| AWS_ACCESS_KEY_ID | IAM user access key | From IAM user creation |
| AWS_SECRET_ACCESS_KEY | IAM user secret key | From IAM user creation |
| AWS_ACCOUNT_ID | Your AWS account ID | `aws sts get-caller-identity` |
| SUPABASE_URL | Supabase project URL | Supabase dashboard → Settings → API |
| SUPABASE_ANON_KEY | Supabase anonymous key | Supabase dashboard → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Supabase dashboard → Settings → API |
| JWT_SECRET | JWT signing secret | Generate a secure random string |
| DATABASE_URL | PostgreSQL connection string | Supabase dashboard → Settings → Database |

### Security Best Practices for CI/CD

1. **Rotate credentials regularly** (every 3 months)
2. **Use least privilege principle** for IAM policies
3. **Monitor usage** with AWS CloudTrail
4. **Never commit secrets** to your repository
5. **Use environment-specific secrets** for dev/prod separation

## Additional Resources

- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [CloudFront Best Practices](https://docs.aws.amazon.com/cloudfront/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)