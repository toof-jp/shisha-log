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

# First, sync all files to S3 with delete flag to remove old files
aws s3 sync dist/ "s3://$S3_BUCKET_NAME" \
    --delete

# Update cache headers for specific file types
# HTML files - standard cache (1 day, will be invalidated on deploy)
aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "*.html" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=86400" \
    --content-type "text/html; charset=utf-8"

# Hashed assets (JS/CSS in assets folder) - long cache (1 year)
aws s3 cp "s3://$S3_BUCKET_NAME/assets" "s3://$S3_BUCKET_NAME/assets" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/octet-stream"

# Specific content types for assets
aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "assets/*.css" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "text/css; charset=utf-8"

aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --exclude "*" \
    --include "assets/*.js" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/javascript; charset=utf-8"

# Other static files (favicon, etc.) - medium cache (1 day)
aws s3 cp "s3://$S3_BUCKET_NAME" "s3://$S3_BUCKET_NAME" \
    --exclude "*.html" \
    --exclude "assets/*" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=86400"

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Create CloudFront invalidation
echo -e "${YELLOW}Creating CloudFront invalidation...${NC}"

# We invalidate all paths (/*) for simplicity
# This ensures all routes get the latest index.html immediately
# CloudFront provides 1000 free invalidation paths per month, which is sufficient for our deployment frequency
# Note: Hashed assets (JS/CSS) don't actually need invalidation as their filenames change,
# but /* is simpler to manage than maintaining a list of all SPA routes
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
    sleep 1
    WAIT_TIME=$((WAIT_TIME + 1))
    
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
