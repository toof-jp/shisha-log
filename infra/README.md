# Shisha Log Infrastructure (AWS Edge Resources)

This directory now focuses on the shared AWS resources that serve the product experience while the backend runtime moves to Kubernetes (GKE). Terraform here manages:

- **S3 + CloudFront**: hosts the React SPA and handles HTTPS termination.
- **ACM (us-east-1)**: provides certificates required by CloudFront.
- **Route 53 (optional)**: manages DNS aliases for `shisha.toof.jp` if AWS is your registrar/authoritative zone.
- **Backup stack**: EventBridge + Lambda + S3 workflow that exports the Supabase PostgreSQL database on a schedule.

The API is no longer deployed to Lightsail. Traffic for `api.shisha.toof.jp` should point to your Kubernetes ingress/load-balancer, and secrets for that workload are expected to live in Google Cloud Secret Manager (see `secretstore-gcpsm.yaml`).

## Repository layout

```
infra/
├── main.tf                  # Root Terraform module
├── variables.tf             # Input variables (only AWS edge + backup)
├── outputs.tf               # Helpful values: S3 bucket, CloudFront IDs, etc.
├── modules/
│   ├── acm/
│   ├── backup/
│   ├── frontend-cloudfront/
│   └── route53/
└── environments/
    ├── dev/terraform.tfvars
    └── prod/terraform.tfvars
```

## Prerequisites

1. Terraform ≥ 1.0 and AWS CLI configured for the target account.
2. An S3 bucket (or other remote state backend) **is strongly recommended**; local state files have been kept only for historical reasons.
3. `TF_VAR_database_url` must be exported before running any Terraform command so that the backup Lambda can reach Supabase. Example:
   ```bash
   export TF_VAR_database_url="postgresql://postgres:password@db.supabase.co:5432/postgres"
   ```
4. (Optional) If you already issued an ACM certificate, set `create_acm_certificate=false` and `acm_certificate_arn` in the tfvars file.

## Deploying the AWS edge stack

```bash
cd infra
terraform init
terraform plan  -var-file=environments/prod/terraform.tfvars -var="database_url=$TF_VAR_database_url"
terraform apply -var-file=environments/prod/terraform.tfvars -var="database_url=$TF_VAR_database_url"
```

Key outputs:
- `frontend_s3_bucket`
- `cloudfront_distribution_id`
- `cloudfront_domain_name`
- `route53_zone_id` / `route53_name_servers` (when `use_route53=true`)

## DNS expectations

- **Frontend**: `shisha.toof.jp` (or your domain) should CNAME/ALIAS to the CloudFront domain provided in the outputs.
- **API**: managed outside of this Terraform stack. Point `api.<domain>` to the Kubernetes ingress you configure on GKE. Route 53 resources for the API were intentionally removed.

## Working with the new secret workflow

1. `secretstore-gcpsm.yaml` – copy this manifest into your Kubernetes repo and replace the placeholders with the real GCP project, cluster and Workload Identity data.
2. `bootstrap-gcp-secrets.sh` – run this script (optionally with `./bootstrap-gcp-secrets.sh .env.prod`) to create/update the required Google Secret Manager entries in kebab-case. The backend ExternalSecret objects can then reference those GSM secrets.

## Frontend deployment recap

The frontend process is unchanged:
```bash
make frontend-build
make deploy-frontend
```
This builds the Vite project, syncs artifacts to the S3 bucket from Terraform outputs, and invalidates the CloudFront cache.

## Backup system checklist

- EventBridge rule → Lambda (`modules/backup`).
- Lambda runs `pg_dump` against `TF_VAR_database_url` and pushes compressed dumps to `s3://<project>-<env>-db-backups/`.
- Default retention is 30 days; adjust `backup_retention_days` if required.

## Next steps for Kubernetes

- Create ExternalSecret manifests that map GSM secrets (from the bootstrap script) into namespace-specific K8s Secrets.
- Configure your ingress (GKE HTTP LB, Cloud Armor, etc.) to terminate TLS for `api.shisha.toof.jp`.
- Update the frontend `.env` (`VITE_API_BASE_URL`) once the ingress endpoint is live.

By separating AWS edge assets from the compute plane you can iterate on the Kubernetes cluster without touching Terraform-managed infrastructure.
