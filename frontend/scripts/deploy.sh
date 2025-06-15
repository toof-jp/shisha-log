#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$S3_BUCKET_NAME" ]; then
    echo -e "${RED}Error: S3_BUCKET_NAME environment variable is not set${NC}"
    exit 1
fi

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${RED}Error: CLOUDFRONT_DISTRIBUTION_ID environment variable is not set${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting frontend deployment...${NC}"

# Build the frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed. dist directory not found${NC}"
    exit 1
fi

# Upload to S3
echo -e "${YELLOW}Uploading to S3 bucket: $S3_BUCKET_NAME${NC}"
aws s3 sync dist/ s3://$S3_BUCKET_NAME/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

# Set cache control for index.html (no cache)
aws s3 cp s3://$S3_BUCKET_NAME/index.html s3://$S3_BUCKET_NAME/index.html \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html" \
    --metadata-directive REPLACE

# Invalidate CloudFront cache
echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text

echo -e "${GREEN}Deployment completed successfully!${NC}"