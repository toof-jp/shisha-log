# Infrastructure Architecture

## Overview

Shisha Log uses a separated domain architecture with dedicated domains for frontend and backend services:

- **Frontend**: Static SPA hosted on AWS S3 + CloudFront
- **Backend**: Dockerized API running on AWS Lightsail
- **Database**: PostgreSQL managed by Supabase

## Domain Configuration

```
shisha.toof.jp          → CloudFront → S3 (Frontend)
api.shisha.toof.jp      → Lightsail (Backend API)
```

## AWS Services

### Frontend Infrastructure

1. **S3 Bucket**: Stores static frontend files (HTML, CSS, JS)
2. **CloudFront Distribution**: 
   - Global CDN for frontend assets
   - HTTPS termination with ACM certificate
   - Custom error pages for SPA routing (404 → index.html)
   - Cache configuration:
     - Default TTL: 1 hour
     - Max TTL: 24 hours

### Backend Infrastructure

1. **Lightsail Container Service**:
   - Runs Docker containers
   - Auto-deployment from ECR Public
   - Static IP for DNS A record
   - Health checks on `/health` endpoint

2. **ECR Public Repository**:
   - Stores Docker images
   - Public registry for easy access

## Terraform Modules

### frontend-cloudfront
- Manages S3 bucket and CloudFront distribution
- Handles SSL/TLS certificates
- Configures caching and error responses

### lightsail
- Provisions container service
- Manages deployments and health checks
- Assigns static IP address

### acm
- Manages SSL certificates in us-east-1 (for CloudFront)
- Handles DNS validation

### route53 (optional)
- Manages DNS records if using Route 53
- Creates A and CNAME records

## Deployment Flow

### Frontend Deployment
```bash
make deploy-frontend
```
1. Build React app
2. Upload to S3
3. Invalidate CloudFront cache

### Backend Deployment
```bash
make deploy-backend
```
1. Build Docker image
2. Push to ECR Public
3. Update Lightsail container

## Environment Configuration

Frontend connects to backend using:
```
VITE_API_BASE_URL=https://api.shisha.toof.jp/api/v1
```

Backend allows CORS from:
```
ALLOWED_ORIGINS=https://shisha.toof.jp
```