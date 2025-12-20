# Deployment Playbook

This guide reflects the post-Lightsail architecture where the API runs in Kubernetes and AWS only serves the edge/front-door concerns.

## 1. Build + Push the backend image

```bash
cd backend
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION=$(git describe --tags --always 2>/dev/null || echo dev)

docker build \
  --build-arg GIT_COMMIT=$GIT_COMMIT \
  --build-arg BUILD_TIME=$BUILD_TIME \
  --build-arg VERSION=$VERSION \
  -t shisha-log:latest .

ecr_alias=${ECR_ALIAS:?set in .env}
docker tag shisha-log:latest public.ecr.aws/$ecr_alias/shisha-log:$VERSION
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
docker push public.ecr.aws/$ecr_alias/shisha-log:$VERSION
```

Update your Kubernetes manifests (Helm/Kustomize) to reference the new tag and apply:

```bash
kubectl apply -f k8s/overlays/prod
```

Secrets inside the cluster should come from Google Secret Manager through External Secrets Operator. Use `bootstrap-gcp-secrets.sh` to ensure GSM values exist before applying manifests.

## 2. Deploy the frontend

```bash
npm install --prefix frontend
make frontend-build
make deploy-frontend
```

`make deploy-frontend` looks up the Terraform outputs (`frontend_s3_bucket`, `cloudfront_distribution_id`), syncs the `dist/` folder to S3 and invalidates CloudFront.

## 3. Update AWS edge infrastructure (if required)

Whenever you need to touch certificates, Route 53 aliases, or the backup stack:

```bash
export TF_VAR_database_url="postgresql://..."  # Supabase URL
d (cd infra && terraform init)
make infra-plan
make infra-apply
```

Terraform will show changes to ACM, CloudFront, Route 53 and the backup Lambda only. Backend compute is entirely outside of this stack.

## 4. DNS considerations

- `shisha.toof.jp` → CloudFront domain (output `cloudfront_domain_name`). This is handled automatically when `use_route53=true`.
- `api.shisha.toof.jp` → Kubernetes ingress IP/hostname. Manage this in Route 53 (outside Terraform) or your registrar once the ingress endpoint is known.

## 5. Secrets & configuration recap

| Location | Purpose |
| -------- | ------- |
| `.env` | Developer convenience, source for scripts. Avoid committing secrets. |
| `bootstrap-gcp-secrets.sh` | Creates/updates GSM secrets in kebab-case (`supabase-service-role-key`, `jwt-secret`, etc.). |
| `secretstore-gcpsm.yaml` | ClusterSecretStore template so ESO can read GSM secrets via Workload Identity. |
| Kubernetes ExternalSecret | Namespace-level mapping from GSM secret → `Secret`. |

## 6. Verification checklist

1. `kubectl get pods -n shisha-log` – backend pods healthy.
2. `kubectl get httproute/ingress` (or load balancer) – note the public hostname/IP and update DNS if it changed.
3. `curl https://api.shisha.toof.jp/health` – API responds 200.
4. `curl https://shisha.toof.jp` – frontend loads, API calls succeed (check browser console for CORS/auth errors).
5. `make backup-trigger && make backup-list` – optional sanity check for Supabase backups after big schema changes.

Following these steps keeps frontend, edge, and Kubernetes deployments aligned without relying on the old Lightsail hosts.
