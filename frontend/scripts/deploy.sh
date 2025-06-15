#!/bin/bash

# Frontend deployment script for Shisha Log
# This script uploads the built frontend to S3 and invalidates CloudFront cache

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$S3_BUCKET_NAME" ]; then
    echo -e "${RED}Error: S3_BUCKET_NAME is not set${NC}"
    exit 1
fi

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${RED}Error: CLOUDFRONT_DISTRIBUTION_ID is not set${NC}"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist directory not found. Run 'npm run build' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting deployment to S3...${NC}"

# Sync files to S3
# --delete removes files from S3 that don't exist locally
# --cache-control sets browser caching headers
echo "Uploading files to S3 bucket: $S3_BUCKET_NAME"

# Upload HTML files with no-cache to ensure fresh content
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html; charset=utf-8"

# Upload CSS files with longer cache
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "*.css" \
    --include "assets/*.css" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "text/css; charset=utf-8"

# Upload JavaScript files with longer cache
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "*.js" \
    --include "assets/*.js" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/javascript; charset=utf-8"

# Upload other assets (images, fonts, etc.)
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --exclude "*.html" \
    --exclude "*.css" \
    --exclude "*.js" \
    --exclude "assets/*.css" \
    --exclude "assets/*.js" \
    --cache-control "public, max-age=31536000"

# Delete files that no longer exist
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --delete

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Create CloudFront invalidation
echo -e "${YELLOW}Creating CloudFront invalidation...${NC}"

INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}✓ CloudFront invalidation created: $INVALIDATION_ID${NC}"

# Wait for invalidation to complete (optional)
echo -e "${YELLOW}Waiting for invalidation to complete...${NC}"
echo "This may take a few minutes. You can check the status with:"
echo "aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"

# Poll invalidation status
INVALIDATION_STATUS="InProgress"
WAIT_TIME=0
MAX_WAIT_TIME=300 # 5 minutes

while [ "$INVALIDATION_STATUS" = "InProgress" ] && [ $WAIT_TIME -lt $MAX_WAIT_TIME ]; do
    sleep 10
    WAIT_TIME=$((WAIT_TIME + 10))
    
    INVALIDATION_STATUS=$(aws cloudfront get-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID" \
        --query 'Invalidation.Status' \
        --output text 2>/dev/null || echo "InProgress")
    
    echo -ne "\rWaiting for invalidation... ${WAIT_TIME}s"
done

echo ""

if [ "$INVALIDATION_STATUS" = "Completed" ]; then
    echo -e "${GREEN}✓ CloudFront invalidation completed!${NC}"
else
    echo -e "${YELLOW}⚠ Invalidation is still in progress. It will complete in the background.${NC}"
fi

echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "Your site will be available at: https://${DOMAIN_NAME:-shisha.toof.jp}"