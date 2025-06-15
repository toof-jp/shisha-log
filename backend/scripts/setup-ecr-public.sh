#!/bin/bash

set -e

echo "Setting up AWS ECR Public repository for shisha-log..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Set region to us-east-1 for ECR Public
export AWS_REGION=us-east-1

# Create ECR Public repository
echo "Creating ECR Public repository..."
aws ecr-public create-repository \
    --repository-name shisha-log \
    --region us-east-1 \
    --catalog-data '{
        "description": "Shisha Log Backend API",
        "architectures": ["x86-64"],
        "operatingSystems": ["Linux"]
    }' 2>/dev/null || echo "Repository already exists"

# Get registry alias
REGISTRY_ALIAS=$(aws ecr-public describe-registries --region us-east-1 --query 'registries[0].registryId' --output text)
REGISTRY_URI="public.ecr.aws/$REGISTRY_ALIAS"

echo ""
echo "ECR Public repository created successfully!"
echo "=========================================="
echo "Registry URI: $REGISTRY_URI"
echo "Repository: shisha-log"
echo "Full image URI: $REGISTRY_URI/shisha-log:latest"
echo ""
echo "Next steps:"
echo "1. Update terraform.tfvars files with the ECR alias: $REGISTRY_ALIAS"
echo "2. Replace 'YOUR_ECR_ALIAS' with '$REGISTRY_ALIAS' in:"
echo "   - infra/environments/dev/terraform.tfvars"
echo "   - infra/environments/prod/terraform.tfvars"
echo ""
echo "To push images:"
echo "  aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws"
echo "  docker tag shisha-log:latest $REGISTRY_URI/shisha-log:latest"
echo "  docker push $REGISTRY_URI/shisha-log:latest"
echo ""
echo "To use in Lightsail, the instance will need:"
echo "  - AWS CLI installed"
echo "  - IAM role or credentials with ecr-public:GetAuthorizationToken permission"