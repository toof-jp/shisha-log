# Infrastructure Architecture

## Overview

Shisha Log uses a unified domain architecture with path-based routing:

- **Frontend**: Static SPA hosted on AWS S3 + CloudFront
- **Backend**: Dockerized API running on AWS Lightsail
- **Database**: PostgreSQL managed by Supabase

## Domain Configuration

```
shisha.toof.jp          → CloudFront → S3 (Frontend)
shisha.toof.jp/api/*    → CloudFront → Lightsail (Backend API)
```

This unified approach is achieved through CloudFront distribution with multiple origins and path-based behaviors.

## AWS Services

### Frontend Infrastructure

1. **S3 Bucket**: Stores static frontend files (HTML, CSS, JS)
2. **CloudFront Distribution**: 
   - Global CDN for frontend assets
   - HTTPS termination with ACM certificate
   - Custom error pages for SPA routing (404 → index.html)
   - Optimized cache configuration:
     - `/assets/*` (hashed files): 1 year cache
     - `index.html`: 1 day cache (invalidated on deploy)
     - Other static files: 1 day cache

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

### backup
- S3 bucket for database backup storage
- Lambda function for backup execution
- EventBridge rule for weekly scheduling
- 30-day retention policy

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
VITE_API_BASE_URL=https://api.shisha.toof.jp/v1
```

Backend allows CORS from:
```
ALLOWED_ORIGINS=https://shisha.toof.jp
```

## Database Backup System

### Architecture
The backup system uses serverless AWS services for automated database backups:

1. **EventBridge Rule**: Triggers backups weekly on Monday at 9:00 AM JST
2. **Lambda Function**: Connects to PostgreSQL and creates SQL dumps
3. **S3 Bucket**: Stores compressed backups with encryption
4. **Lifecycle Policy**: Automatically deletes backups older than 30 days

### Backup Operations

#### Automated Backups
- Schedule: Every Monday at 9:00 AM JST (0:00 UTC)
- Format: Compressed SQL dump (`.sql.gz`)
- Storage: `s3://shisha-log-prod-db-backups/backups/YYYY/MM/`
- Naming: `shisha-log_prod_dbname_YYYYMMDD_HHMMSS.sql.gz`

#### Manual Backup Commands
```bash
# Test backup locally
make backup-test

# Trigger manual backup
make backup-trigger

# List recent backups
make backup-list

# Download latest backup
make backup-download
```

#### Recovery Process
1. Download backup file: `make backup-download`
2. Extract: `gunzip backup-file.sql.gz`
3. Restore: `psql $DATABASE_URL < backup-file.sql`

### Security
- S3 bucket encrypted with AES-256
- Public access blocked
- Lambda function has minimal IAM permissions
- Database credentials stored as environment variables