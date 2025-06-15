#!/bin/bash

# Backend deployment script
# This script builds and pushes the Docker image, then updates Lightsail

set -e

echo "=== Backend Deployment Script ==="
echo "Started at: $(date)"
echo

# Load environment variables
if [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

if [ -z "$ECR_ALIAS" ]; then
    echo "ERROR: ECR_ALIAS not set in .env"
    exit 1
fi

LIGHTSAIL_IP="35.75.202.209"
ECR_URI="public.ecr.aws/$ECR_ALIAS/shisha-log"

# Get version info
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION="1.0.0"

echo "1. Building Docker image..."
echo "   Git commit: $GIT_COMMIT"
echo "   Build time: $BUILD_TIME"
echo "   Version: $VERSION"

docker build \
    --build-arg GIT_COMMIT=$GIT_COMMIT \
    --build-arg BUILD_TIME=$BUILD_TIME \
    --build-arg VERSION=$VERSION \
    -t shisha-log:latest .
echo

echo "2. Tagging image for ECR..."
docker tag shisha-log:latest $ECR_URI:latest
echo

echo "3. Getting ECR login token..."
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
echo

echo "4. Pushing image to ECR..."
docker push $ECR_URI:latest
echo

echo "5. Updating Lightsail container..."
echo "   Connecting to Lightsail instance at $LIGHTSAIL_IP..."

# Copy and execute the update script on Lightsail
ssh -o StrictHostKeyChecking=no ubuntu@$LIGHTSAIL_IP 'bash -s' < ./scripts/update-lightsail.sh

echo
echo "=== Deployment completed successfully! ==="
echo "Check the application at: https://api.shisha.toof.jp/api/v1/health"