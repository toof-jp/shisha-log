# Unified Domain Infrastructure

This configuration deploys Shisha Log with a single domain serving both frontend and backend.

## Quick Start

1. **Create ACM Certificate** (us-east-1):
   ```bash
   aws acm request-certificate \
     --domain-name shisha.toof.jp \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Validate Certificate** by adding CNAME record to your DNS

3. **Configure Terraform**:
   ```bash
   cd infra
   cp environments/prod/terraform-unified.tfvars.example environments/prod/terraform-unified.tfvars
   # Edit the file with your values
   ```

4. **Deploy**:
   ```bash
   terraform init
   terraform apply -f main-unified.tf -var-file=environments/prod/terraform-unified.tfvars
   ```

5. **Configure DNS** - Add CNAME record pointing to CloudFront distribution

6. **Deploy Applications**:
   ```bash
   # Frontend
   cd ../frontend
   npm run build
   aws s3 sync dist/ s3://[S3_BUCKET_NAME]/ --delete
   aws cloudfront create-invalidation --distribution-id [DIST_ID] --paths "/*"
   ```

## Files

- `main-unified.tf` - Main Terraform configuration
- `variables-unified.tf` - Variable definitions
- `outputs-unified.tf` - Output definitions
- `modules/unified-cloudfront/` - CloudFront module with path-based routing

## Environment Variables

Set these before running Terraform:
```bash
export TF_VAR_supabase_url="your-supabase-url"
export TF_VAR_supabase_anon_key="your-anon-key"
export TF_VAR_supabase_service_role_key="your-service-key"
export TF_VAR_jwt_secret="your-jwt-secret"
export TF_VAR_database_url="your-database-url"
export TF_VAR_registry_username="your-registry-username"
export TF_VAR_registry_password="your-registry-password"
export TF_VAR_origin_custom_header_value="your-secret-value"
```

## Architecture

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │ shisha.toof.jp  │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           /api/*,/health            /* (default)
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │  Lightsail   │         │      S3      │
        │   Backend    │         │   Frontend   │
        │   (Docker)   │         │  (React SPA) │
        └──────────────┘         └──────────────┘
                │
                ▼
        ┌──────────────┐
        │   Supabase   │
        │  PostgreSQL  │
        └──────────────┘
```

## Monitoring

- CloudFront metrics in CloudWatch
- Lightsail metrics in Lightsail console
- Application logs in CloudWatch Logs (if configured)