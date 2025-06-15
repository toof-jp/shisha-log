# Frontend Deployment Guide

## S3 + CloudFront Architecture

The frontend is deployed as a static site using:
- **S3**: Static file hosting
- **CloudFront**: Global CDN with HTTPS support

## Deployment Methods

### 1. Automated Deployment (GitHub Actions)

Deployments are triggered automatically when:
- Pushing to `main` branch with changes in `frontend/`
- Manually triggering the workflow from GitHub Actions

Required GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_BASE_URL`

### 2. Manual Deployment

```bash
cd frontend

# Set environment variables
export S3_BUCKET_NAME="shisha-log-prod-frontend"
export CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"

# Run deployment script
./scripts/deploy.sh
```

### 3. Terraform Deployment

First time setup:
```bash
cd infra
terraform apply -var-file=environments/prod/terraform.tfvars
```

The Terraform output will show:
- S3 bucket name
- CloudFront distribution ID
- CloudFront domain name

## ACM Certificate Setup (for custom domain)

1. Create certificate in **us-east-1** region (required for CloudFront):
```bash
aws acm request-certificate \
  --domain-name shisha.toof.jp \
  --validation-method DNS \
  --region us-east-1
```

2. Complete DNS validation
3. Update `frontend_acm_certificate_arn` in terraform.tfvars
4. Re-run terraform apply

## Post-Deployment

1. Update DNS records:
   - CNAME: shisha.toof.jp → CloudFront distribution domain

2. Test the deployment:
   - https://[cloudfront-domain].cloudfront.net
   - https://shisha.toof.jp (after DNS propagation)

## Troubleshooting

- **404 errors**: CloudFront is configured to serve index.html for all routes (SPA support)
- **Cache issues**: Invalidation is automatic, but can be manual: `aws cloudfront create-invalidation --distribution-id EXXXXX --paths "/*"`
- **CORS errors**: Ensure backend allows the CloudFront domain in ALLOWED_ORIGINS