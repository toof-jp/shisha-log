# CloudFront Caching Strategy

## Overview

This document explains the caching strategy implemented for the Shisha Log frontend application hosted on CloudFront.

## Cache TTL Configuration

### 1. Hashed Assets (`/assets/*`)
- **TTL**: 31,536,000 seconds (1 year)
- **Cache-Control**: `public, max-age=31536000, immutable`
- **Reason**: Vite generates hashed filenames for JS and CSS files (e.g., `main.abc123.js`). When content changes, the filename changes, making it safe to cache indefinitely.

### 2. HTML Files (`*.html`)
- **TTL**: 86,400 seconds (1 day)
- **Cache-Control**: `public, max-age=86400`
- **Reason**: `index.html` contains references to the hashed assets. While it has a 1-day cache, we use CloudFront invalidation on every deployment to ensure immediate updates.

### 3. Other Static Files
- **TTL**: 86,400 seconds (1 day)
- **Cache-Control**: `public, max-age=86400`
- **Reason**: Files like `favicon.ico`, `robots.txt`, and images change infrequently but may need updates occasionally.

## Benefits

1. **Performance**: Hashed assets are cached for a year, reducing load times for returning users
2. **Freshness**: CloudFront invalidation ensures users get new deployments immediately
3. **Bandwidth**: Reduced origin requests save bandwidth and costs
4. **Reliability**: CloudFront edge locations serve cached content even if origin is temporarily unavailable

## Deployment Considerations

1. **Invalidation**: We use `/*` invalidation for simplicity, ensuring all routes get fresh content immediately
2. **Cost**: CloudFront provides 1000 free invalidation paths per month, sufficient for daily deployments
3. **Rollback**: Old hashed assets remain accessible for users who haven't refreshed
4. **Immediate Updates**: Despite 1-hour HTML cache, invalidation ensures immediate rollout of new versions

## Monitoring

Monitor these CloudFront metrics:
- Cache Hit Ratio (should be >90% for assets)
- Origin Latency
- 4xx/5xx Error Rate

## Future Improvements

1. Consider using CloudFront cache policies instead of cache behaviors
2. Implement versioned API endpoints to enable API caching
3. Add cache headers for specific content types (fonts, images)