# AWS ECR Public Setup Guide

This guide explains how to set up AWS ECR Public for the Shisha Log Backend.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed

## 1. Create ECR Public Repository

Run the setup script:

```bash
./scripts/setup-ecr-public.sh
```

This script will:
- Create an ECR Public repository named `shisha-log`
- Display your registry alias (e.g., `a1b2c3d4`)
- Show the full image URI

## 2. Update IAM Policy for GitHub Actions

Update your GitHub Actions IAM user policy:

```bash
# Create or update the policy
aws iam create-policy \
  --policy-name GitHubActionsECRPublicPolicy \
  --policy-document file://infra/github-actions-ecr-policy.json

# Attach to your GitHub Actions user
aws iam attach-user-policy \
  --user-name github-actions-shisha-log \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitHubActionsECRPublicPolicy
```

## 3. Update Terraform Configuration

Replace `YOUR_ECR_ALIAS` with your actual ECR alias in:
- `infra/environments/dev/terraform.tfvars`
- `infra/environments/prod/terraform.tfvars`

Example:
```hcl
container_image = "a1b2c3d4/shisha-log:dev-latest"
```

## 4. Configure Lightsail Instance

The Lightsail instance needs AWS CLI to pull from ECR Public:

```bash
# On the Lightsail instance
sudo apt-get update
sudo apt-get install -y awscli

# Configure credentials (use IAM role or access keys)
aws configure set region us-east-1
```

## 5. Manual Docker Commands

### Login to ECR Public
```bash
aws ecr-public get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin public.ecr.aws
```

### Build and Push
```bash
# Build image
docker build -t shisha-log .

# Tag for ECR Public
docker tag shisha-log:latest public.ecr.aws/YOUR_ALIAS/shisha-log:latest

# Push to ECR Public
docker push public.ecr.aws/YOUR_ALIAS/shisha-log:latest
```

## 6. GitHub Actions Configuration

The workflow automatically:
1. Logs in to ECR Public
2. Builds and tags the image
3. Pushes to ECR Public
4. Deploys to Lightsail

No additional secrets needed for ECR Public (uses AWS credentials).

## ECR Public Benefits

- **Free Tier**: 50 GB/month storage, 500 GB/month data transfer
- **Public Access**: No authentication needed for pulls
- **AWS Integration**: Works seamlessly with other AWS services
- **High Availability**: Distributed across multiple AZs

## Troubleshooting

### Cannot push to ECR Public
- Ensure you're in `us-east-1` region
- Check IAM permissions
- Verify repository exists

### Cannot pull from Lightsail
- Ensure AWS CLI is installed on instance
- Check instance has internet access
- Verify image URI is correct

### Authentication issues
```bash
# Clear Docker credentials
docker logout public.ecr.aws

# Re-authenticate
aws ecr-public get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin public.ecr.aws
```

## Cost Considerations

ECR Public is free for:
- First 50 GB/month of storage
- First 500 GB/month of data transfer to the internet

Beyond free tier:
- Storage: $0.10 per GB/month
- Data transfer: $0.09 per GB