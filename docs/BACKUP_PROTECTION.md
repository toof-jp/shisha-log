# Backup Protection Guide

This guide explains how the S3 backup bucket is protected from accidental deletion and how to manage infrastructure teardown while preserving backups.

## Overview

The S3 backup bucket stores critical database backups and is protected using Terraform's `prevent_destroy` lifecycle rule. This ensures that the bucket cannot be accidentally deleted during infrastructure operations.

## Protection Mechanism

### Terraform Lifecycle Protection

In `infra/modules/backup/main.tf`, the S3 bucket has the following protection:

```hcl
resource "aws_s3_bucket" "backup" {
  bucket = "${var.project_name}-${var.environment}-db-backups"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-backups"
    Project     = var.project_name
    Environment = var.environment
  }
}
```

This `prevent_destroy = true` setting prevents Terraform from deleting the bucket during:
- `terraform destroy` operations
- Resource replacements
- Module removal

## Infrastructure Management

### Destroying Infrastructure While Keeping Backups

Use the dedicated Makefile target to destroy all infrastructure except the backup bucket:

```bash
make infra-destroy-except-backup
```

This command will:
1. Destroy the Lightsail instance
2. Destroy the CloudFront distribution
3. Destroy the S3 frontend bucket
4. Destroy Route53 records
5. Destroy ACM certificates
6. **Preserve the S3 backup bucket and its contents**

### Complete Infrastructure Destruction

If you need to destroy everything including the backup bucket:

1. First, manually backup or export any critical data
2. Remove the `prevent_destroy` lifecycle rule from the S3 bucket
3. Run `terraform apply` to update the state
4. Then run `make infra-destroy`

**WARNING**: This will permanently delete all backups. Ensure you have exported necessary data first.

### Checking What Will Be Destroyed

Before destroying infrastructure, always plan first:

```bash
# Plan destruction except backup
cd infra && terraform plan -destroy \
  -target=module.lightsail \
  -target=module.frontend \
  -target=module.frontend_cloudfront \
  -target=module.route53 \
  -target=module.acm \
  -var-file=environments/prod/terraform.tfvars
```

## Backup Management

### Listing Backups

```bash
make backup-list
```

### Downloading Backups

Before destroying infrastructure, download important backups:

```bash
# Download the latest backup
make backup-download

# Download a specific backup
aws s3 cp s3://shisha-log-prod-db-backups/2024-01-15_00-00-00.sql.zst ./
```

### Manual Backup Before Destruction

```bash
# Trigger a manual backup
make backup-trigger

# Wait for completion and verify
make backup-list
```

## Recovery Scenarios

### Scenario 1: Accidental Infrastructure Deletion

If infrastructure was destroyed but backups remain:

1. Rebuild infrastructure: `make infra-apply`
2. Restore database from backup
3. Redeploy application

### Scenario 2: Moving to New AWS Account

1. Download all backups: `aws s3 sync s3://shisha-log-prod-db-backups ./backups/`
2. Destroy infrastructure except backup: `make infra-destroy-except-backup`
3. In new account: create infrastructure and upload backups

### Scenario 3: Cost Optimization

To temporarily shut down services but keep backups:

1. Run `make infra-destroy-except-backup`
2. Backups remain in S3 (minimal cost)
3. Restore infrastructure later with `make infra-apply`

## Best Practices

1. **Always backup before destruction**
   - Run `make backup-trigger` before any destruction
   - Download critical backups locally

2. **Use targeted destruction**
   - Prefer `make infra-destroy-except-backup` over full destroy
   - This preserves your backup history

3. **Document backup contents**
   - Keep a record of what each backup contains
   - Note any special backups (before major changes, etc.)

4. **Test restore procedures**
   - Periodically test restoring from backups
   - Document the restore process

5. **Monitor backup costs**
   - S3 storage is cheap but not free
   - Old backups are automatically deleted based on retention policy

## Cost Considerations

Keeping only the S3 backup bucket has minimal costs:
- Storage: ~$0.023 per GB per month
- No compute or transfer costs
- Lifecycle rules automatically delete old backups

Example: 1GB of compressed backups = ~$0.023/month

## Troubleshooting

### Error: "Instance cannot be destroyed"

If you see an error about preventing destruction:

```
Error: Instance cannot be destroyed
Resource module.backup.aws_s3_bucket.backup has lifecycle.prevent_destroy set
```

This is expected behavior. The backup bucket is protected. Use `make infra-destroy-except-backup` instead.

### Removing Protection

If you absolutely must remove the protection:

1. Edit `infra/modules/backup/main.tf`
2. Remove or set `prevent_destroy = false`
3. Run `terraform apply`
4. Now you can destroy the bucket

**WARNING**: Only do this if you're certain you don't need the backups.