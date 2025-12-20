# Infrastructure Architecture

## Overview

Shisha Log now separates the concerns between AWS edge services and the Kubernetes runtime:

- **Frontend**: React SPA built with Vite, stored in S3 and delivered worldwide via CloudFront.
- **Backend**: Go API running on a GKE cluster. Kubernetes manifests (External Secrets Operator, Ingress, HPA, etc.) live outside this repo.
- **Database**: Supabase (PostgreSQL) plus a Lambda-based backup routine in AWS.

## Domain configuration

```
shisha.toof.jp       → CloudFront → S3 (frontend SPA)
api.shisha.toof.jp   → GCP HTTPS Load Balancer / GKE Ingress (backend API)
```

Terraform only manages the frontend/edge portion. The API subdomain should be pointed to the Kubernetes ingress endpoint once it is provisioned.

## AWS components

### Frontend edge
1. **S3 bucket** – versioned bucket that stores the compiled assets.
2. **CloudFront distribution** – handles HTTPS, caching, compression and SPA-friendly error responses. The ACM certificate is issued in `us-east-1`.

### DNS (optional)
- **Route 53** – if `use_route53=true`, Terraform updates the hosted zone to alias the domain to CloudFront. Otherwise reuse your existing registrar.

### Database backups
1. **EventBridge rule** – triggers weekly at 09:00 JST (00:00 UTC).
2. **Lambda function** – uses the `DATABASE_URL` secret to run `pg_dump` against Supabase.
3. **S3 backup bucket** – stores compressed SQL dumps with 30‑day lifecycle policy.

## Kubernetes backend (high level)

- Secrets live in **Google Cloud Secret Manager** and are synced into namespaces with **External Secrets Operator**. See `secretstore-gcpsm.yaml` for the ClusterSecretStore template and `bootstrap-gcp-secrets.sh` for provisioning GSM entries.
- Deployments/Services/Ingress rules are managed in the Kubernetes repo. The ingress exposes `api.shisha.toof.jp`, and Route 53 (or another DNS provider) should have an `A`/`CNAME` pointing to that load balancer.

## Terraform modules in this repo

| Module | Purpose |
| ------ | ------- |
| `acm` | Issues/validates certificates in `us-east-1` for CloudFront aliases. |
| `frontend-cloudfront` | Creates the S3 bucket, CloudFront distribution and outputs deployment metadata. |
| `route53` | (Optional) Creates Apex/WWW aliases for the CloudFront distribution. |
| `backup` | Sets up the Lambda + S3 backup workflow for Supabase. |

## Deployment flow

1. **Backend (Kubernetes)** – build/push the backend image to your registry, update Helm/Kustomize manifests, and apply via `kubectl`/GitOps. Secrets are pulled from GSM via ESO.
2. **Frontend** – `make deploy-frontend` builds the Vite app, syncs files to S3, and invalidates CloudFront.
3. **Infrastructure changes** – `make infra-plan` / `make infra-apply` after exporting `TF_VAR_database_url`.

## Backup operations

```bash
make backup-test        # run Lambda locally
make backup-trigger     # invoke the AWS backup pipeline
make backup-list        # show stored dumps
make backup-download    # pull the most recent dump
```

Recovery steps: download a dump, `gunzip`, then `psql $DATABASE_URL < backup.sql`.

## Security highlights

- CloudFront enforces TLS 1.2+, caches only safe paths, and strips unneeded headers.
- S3 buckets and Route 53 hosted zones remain private except for CloudFront access.
- Backups are encrypted at-rest in S3 and rotated automatically.
- Secrets for the runtime are centralized in GSM, reducing scattered `.env` files.
