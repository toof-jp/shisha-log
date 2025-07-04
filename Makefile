.PHONY: all help clean install
.PHONY: backend-build backend-run backend-dev backend-test backend-clean backend-deps backend-fmt backend-lint backend-swagger
.PHONY: frontend-build frontend-dev frontend-test frontend-clean frontend-install frontend-lint frontend-typecheck
.PHONY: docker-build docker-run docker-push ecr-login update-ecr-password
.PHONY: deploy-frontend deploy-backend deploy-all
.PHONY: infra-init infra-plan infra-apply infra-destroy infra-destroy-force infra-output infra-apply-module
.PHONY: db-migrate db-reset db-status
.PHONY: backup-test backup-trigger backup-list backup-download
.PHONY: route53-list-zones route53-find-zone route53-list-records route53-test-dns
.PHONY: create-acm-cert list-acm-certs check-acm-cert manage-acm-cert cert-validation-status
.PHONY: setup-env setup-ecr setup-all supabase-types dev

# Default target
help:
	@echo "Shisha Log - Makefile Commands"
	@echo ""
	@echo "Backend Commands:"
	@echo "  make backend-build      - Build the Go backend application"
	@echo "  make backend-run        - Run the backend application"
	@echo "  make backend-dev        - Run backend with hot reload"
	@echo "  make backend-test       - Run backend tests"
	@echo "  make backend-fmt        - Format backend code"
	@echo "  make backend-lint       - Run backend linter"
	@echo "  make backend-swagger    - Generate Swagger/OpenAPI documentation"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make frontend-install   - Install frontend dependencies"
	@echo "  make frontend-build     - Build frontend for production"
	@echo "  make frontend-dev       - Run frontend development server"
	@echo "  make frontend-test      - Run frontend tests"
	@echo "  make frontend-lint      - Run frontend linter"
	@echo "  make frontend-typecheck - Run TypeScript type checking"
	@echo "  make typecheck          - Run TypeScript type checking (alias)"
	@echo "  make build              - Build both frontend and backend"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy-frontend    - Deploy frontend to S3/CloudFront"
	@echo "  make deploy-backend     - Build and push backend Docker image"
	@echo "  make deploy-all         - Deploy both frontend and backend"
	@echo ""
	@echo "Database Migration Commands:"
	@echo "  make db-migrate         - Apply database migrations"
	@echo "  make db-reset           - Reset database with new schema (WARNING: deletes all data)"
	@echo "  make db-status          - Check current database schema status"
	@echo ""
	@echo "Backup Commands:"
	@echo "  make backup-test        - Test backup Lambda function locally"
	@echo "  make backup-trigger     - Manually trigger backup Lambda function"
	@echo "  make backup-list        - List recent backups in S3"
	@echo "  make backup-download    - Download latest backup from S3"
	@echo ""
	@echo "Infrastructure Commands:"
	@echo "  make infra-init         - Initialize Terraform"
	@echo "  make infra-plan         - Plan infrastructure changes"
	@echo "  make infra-apply        - Apply infrastructure changes"
	@echo "  make infra-destroy      - Destroy infrastructure (with confirmation)"
	@echo "  make infra-destroy-force - Force destroy without confirmation"
	@echo "  make infra-destroy-except-backup - Destroy all except S3 backup bucket"
	@echo "  make infra-output       - Show Terraform outputs"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build       - Build backend Docker image"
	@echo "  make docker-run         - Run backend Docker container"
	@echo "  make docker-push        - Push to ECR Public"
	@echo "  make ecr-login          - Get ECR login password"
	@echo "  make update-ecr-password - Update ECR password in .env"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup-env          - Create .env files from examples"
	@echo "  make setup-all          - Run all setup tasks"
	@echo ""
	@echo "Route 53 Commands:"
	@echo "  make route53-list-zones - List all Route 53 hosted zones"
	@echo "  make route53-find-zone DOMAIN=example.com - Find zone for specific domain"
	@echo "  make route53-list-records - List records in the project zone"
	@echo "  make route53-test-dns   - Test DNS resolution for app domains"
	@echo ""
	@echo "Certificate Commands:"
	@echo "  make check-acm-cert     - Check if ACM certificate exists for domain"
	@echo "  make manage-acm-cert    - Auto-detect and manage ACM certificate"
	@echo "  make create-acm-cert    - Manually create ACM certificate"
	@echo "  make list-acm-certs     - List all ACM certificates in us-east-1"
	@echo "  make cert-validation-status - Check certificate validation status"

# Version info
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION := 1.0.0

# Build flags
LDFLAGS := -X 'github.com/toof-jp/shisha-log/backend/internal/version.GitCommit=$(GIT_COMMIT)' \
           -X 'github.com/toof-jp/shisha-log/backend/internal/version.BuildTime=$(BUILD_TIME)' \
           -X 'github.com/toof-jp/shisha-log/backend/internal/version.Version=$(VERSION)'

# Backend commands
backend-build:
	cd backend && go build -ldflags "$(LDFLAGS)" -o bin/server cmd/server/main.go

backend-run:
	cd backend && go run cmd/server/main.go

backend-dev:
	@if command -v air >/dev/null 2>&1; then \
		cd backend && air; \
	elif [ -f /home/toof/go/bin/air ]; then \
		cd backend && /home/toof/go/bin/air; \
	elif [ -f $(HOME)/go/bin/air ]; then \
		cd backend && $(HOME)/go/bin/air; \
	else \
		echo "air not found. Installing..."; \
		go install github.com/air-verse/air@latest; \
		cd backend && $(HOME)/go/bin/air; \
	fi

backend-test:
	cd backend && go test -v ./...

backend-clean:
	cd backend && rm -rf bin/

backend-deps:
	cd backend && go mod download && go mod tidy

backend-fmt:
	cd backend && go fmt ./...

backend-lint:
	cd backend && golangci-lint run

backend-swagger:
	@if command -v swag >/dev/null 2>&1; then \
		cd backend && swag init -g cmd/server/main.go; \
	elif [ -f /home/toof/go/bin/swag ]; then \
		cd backend && /home/toof/go/bin/swag init -g cmd/server/main.go; \
	elif [ -f $(HOME)/go/bin/swag ]; then \
		cd backend && $(HOME)/go/bin/swag init -g cmd/server/main.go; \
	else \
		echo "swag not found. Installing..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
		cd backend && $(HOME)/go/bin/swag init -g cmd/server/main.go; \
	fi

# Frontend commands
frontend-install:
	cd frontend && npm install

frontend-build:
	cd frontend && npm run build

frontend-dev:
	cd frontend && npm run dev

frontend-test:
	@echo "Frontend tests not yet configured"

frontend-lint:
	cd frontend && npm run lint

frontend-typecheck:
	cd frontend && npm run typecheck

frontend-clean:
	cd frontend && rm -rf dist node_modules

# Convenience aliases
typecheck: frontend-typecheck

build: backend-build frontend-build

# Deployment commands
deploy-frontend: frontend-build
	@echo "Deploying frontend to S3/CloudFront..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	echo "Getting deployment configuration from Terraform..."; \
	export S3_BUCKET_NAME=$$(cd infra && terraform output -raw frontend_s3_bucket 2>/dev/null || echo "$$S3_BUCKET_NAME"); \
	if [ -z "$$S3_BUCKET_NAME" ]; then echo "Error: Could not retrieve S3 bucket name"; exit 1; fi; \
	export CLOUDFRONT_DISTRIBUTION_ID=$$(cd infra && terraform output -raw cloudfront_distribution_id 2>/dev/null || aws cloudfront list-distributions --query "DistributionList.Items[?contains(Comment, 'shisha-log prod')].Id" --output text); \
	if [ -z "$$CLOUDFRONT_DISTRIBUTION_ID" ]; then echo "Error: Could not retrieve CloudFront distribution ID"; exit 1; fi; \
	echo "Using S3 bucket: $$S3_BUCKET_NAME"; \
	echo "Using CloudFront distribution ID: $$CLOUDFRONT_DISTRIBUTION_ID"; \
	cd frontend && ./scripts/deploy.sh

deploy-backend: docker-build docker-push
	@echo "Updating Lightsail instance with new image..."
	@./backend/scripts/update-lightsail-with-auth.sh

deploy-all: deploy-frontend deploy-backend
	@echo "Full deployment completed!"

# Docker commands
docker-build:
	cd backend && docker build \
		--build-arg GIT_COMMIT=$(GIT_COMMIT) \
		--build-arg BUILD_TIME=$(BUILD_TIME) \
		--build-arg VERSION=$(VERSION) \
		-t shisha-log .

docker-run:
	docker run --env-file .env -p 8080:8080 shisha-log

docker-push: update-ecr-password
	@echo "Pushing to ECR Public..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -z "$$ECR_ALIAS" ]; then echo "Error: ECR_ALIAS environment variable not set"; exit 1; fi; \
	aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws; \
	docker tag shisha-log:latest public.ecr.aws/$$ECR_ALIAS/shisha-log:latest; \
	docker push public.ecr.aws/$$ECR_ALIAS/shisha-log:latest

# ECR login helper
ecr-login:
	@echo "Getting ECR login password..."
	@aws ecr-public get-login-password --region us-east-1

# Update ECR password in .env
update-ecr-password:
	@echo "Updating ECR password in .env..."
	@ECR_PASSWORD=$$(aws ecr-public get-login-password --region us-east-1); \
	if [ -z "$$ECR_PASSWORD" ]; then echo "Error: Failed to get ECR password"; exit 1; fi; \
	if [ -f .env ]; then \
		cp .env .env.backup; \
		sed -i.tmp '/^REGISTRY_PASSWORD=/d' .env && rm -f .env.tmp; \
		echo "REGISTRY_PASSWORD=$$ECR_PASSWORD" >> .env; \
		echo "ECR password updated in .env (backup saved as .env.backup)"; \
	else \
		echo "Error: .env file not found"; exit 1; \
	fi

# Infrastructure commands
infra-init:
	cd infra && terraform init

infra-plan: manage-acm-cert
	@echo "Planning infrastructure changes..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -f .acm_cert ]; then . ./.acm_cert; fi; \
	cd infra && terraform plan -var-file=environments/prod/terraform.tfvars \
		-var="supabase_url=$$SUPABASE_URL" \
		-var="supabase_anon_key=$$SUPABASE_ANON_KEY" \
		-var="supabase_service_role_key=$$SUPABASE_SERVICE_ROLE_KEY" \
		-var="jwt_secret=$$JWT_SECRET" \
		-var="database_url=$$DATABASE_URL" \
		-var="registry_username=$$REGISTRY_USERNAME" \
		-var="registry_password=$$REGISTRY_PASSWORD" \
		-var="create_acm_certificate=$${CREATE_ACM_CERTIFICATE:-true}" \
		-var="acm_certificate_arn=$${ACM_CERTIFICATE_ARN:-}"

infra-apply: update-ecr-password manage-acm-cert
	@echo "Applying infrastructure..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -f .acm_cert ]; then . ./.acm_cert; fi; \
	cd infra && terraform apply -var-file=environments/prod/terraform.tfvars \
		-var="supabase_url=$$SUPABASE_URL" \
		-var="supabase_anon_key=$$SUPABASE_ANON_KEY" \
		-var="supabase_service_role_key=$$SUPABASE_SERVICE_ROLE_KEY" \
		-var="jwt_secret=$$JWT_SECRET" \
		-var="database_url=$$DATABASE_URL" \
		-var="registry_username=$$REGISTRY_USERNAME" \
		-var="registry_password=$$REGISTRY_PASSWORD" \
		-var="create_acm_certificate=$${CREATE_ACM_CERTIFICATE:-true}" \
		-var="acm_certificate_arn=$${ACM_CERTIFICATE_ARN:-}"

infra-destroy:
	@echo "Destroying infrastructure..."
	@echo "WARNING: This will destroy all infrastructure. Press Ctrl+C to cancel."
	@sleep 3
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	cd infra && terraform destroy -var-file=environments/prod/terraform.tfvars \
		-var="supabase_url=$$SUPABASE_URL" \
		-var="supabase_anon_key=$$SUPABASE_ANON_KEY" \
		-var="supabase_service_role_key=$$SUPABASE_SERVICE_ROLE_KEY" \
		-var="jwt_secret=$$JWT_SECRET" \
		-var="database_url=$$DATABASE_URL" \
		-var="registry_username=$$REGISTRY_USERNAME" \
		-var="registry_password=$$REGISTRY_PASSWORD"

# Force destroy without confirmation
infra-destroy-force:
	@echo "Force destroying infrastructure..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	cd infra && terraform destroy -var-file=environments/prod/terraform.tfvars \
		-var="supabase_url=$$SUPABASE_URL" \
		-var="supabase_anon_key=$$SUPABASE_ANON_KEY" \
		-var="supabase_service_role_key=$$SUPABASE_SERVICE_ROLE_KEY" \
		-var="jwt_secret=$$JWT_SECRET" \
		-var="database_url=$$DATABASE_URL" \
		-var="registry_username=$$REGISTRY_USERNAME" \
		-var="registry_password=$$REGISTRY_PASSWORD" \
		-auto-approve

# Destroy all infrastructure except S3 backup bucket
infra-destroy-except-backup:
	@echo "Destroying infrastructure except S3 backup bucket..."
	@echo "WARNING: This will destroy all infrastructure except the backup bucket. Press Ctrl+C to cancel."
	@sleep 3
	@echo "Note: The S3 backup bucket has prevent_destroy=true and will be preserved."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	cd infra && terraform destroy -var-file=environments/prod/terraform.tfvars \
		-target=module.lightsail \
		-target=module.frontend \
		-target=module.frontend_cloudfront \
		-target=module.route53 \
		-target=module.acm \
		-var="supabase_url=$$SUPABASE_URL" \
		-var="supabase_anon_key=$$SUPABASE_ANON_KEY" \
		-var="supabase_service_role_key=$$SUPABASE_SERVICE_ROLE_KEY" \
		-var="jwt_secret=$$JWT_SECRET" \
		-var="database_url=$$DATABASE_URL" \
		-var="registry_username=$$REGISTRY_USERNAME" \
		-var="registry_password=$$REGISTRY_PASSWORD"

infra-output:
	cd infra && terraform output

# ACM Certificate management
create-acm-cert:
	@echo "Creating ACM certificate for domain..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -z "$$DOMAIN_NAME" ]; then echo "Error: DOMAIN_NAME not set in .env"; exit 1; fi; \
	aws acm request-certificate \
		--domain-name $$DOMAIN_NAME \
		--validation-method DNS \
		--region us-east-1 \
		--query 'CertificateArn' \
		--output text

list-acm-certs:
	@echo "Listing ACM certificates in us-east-1..."
	@aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[*].[DomainName,CertificateArn,Status]' --output table

# Check if ACM certificate exists for domain
check-acm-cert:
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	DOMAIN=$${DOMAIN_NAME:-shisha.toof.jp}; \
	echo "Checking for ACM certificate for domain: $$DOMAIN"; \
	CERT_ARN=$$(aws acm list-certificates --region us-east-1 \
		--query "CertificateSummaryList[?DomainName=='$$DOMAIN' && Status=='ISSUED'].CertificateArn | [0]" \
		--output text); \
	if [ "$$CERT_ARN" != "None" ] && [ -n "$$CERT_ARN" ]; then \
		echo "Certificate found: $$CERT_ARN"; \
		echo "$$CERT_ARN"; \
	else \
		echo "No certificate found for $$DOMAIN"; \
		exit 1; \
	fi

# Manage ACM certificate - create if doesn't exist
manage-acm-cert:
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	DOMAIN=$${DOMAIN_NAME:-shisha.toof.jp}; \
	echo "Managing ACM certificate for domain: $$DOMAIN"; \
	CERT_ARN=$$(aws acm list-certificates --region us-east-1 \
		--query "CertificateSummaryList[?DomainName=='$$DOMAIN' && Status=='ISSUED'].CertificateArn | [0]" \
		--output text 2>/dev/null); \
	if [ "$$CERT_ARN" != "None" ] && [ -n "$$CERT_ARN" ]; then \
		echo "Using existing certificate: $$CERT_ARN"; \
		echo "export ACM_CERTIFICATE_ARN=$$CERT_ARN" > .acm_cert; \
		echo "export CREATE_ACM_CERTIFICATE=false" >> .acm_cert; \
	else \
		echo "No certificate found. Terraform will create one automatically."; \
		echo "export CREATE_ACM_CERTIFICATE=true" > .acm_cert; \
	fi

# Get certificate validation status
cert-validation-status:
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	DOMAIN=$${DOMAIN_NAME:-shisha.toof.jp}; \
	echo "Checking certificate validation status for: $$DOMAIN"; \
	CERT_ARN=$$(aws acm list-certificates --region us-east-1 \
		--query "CertificateSummaryList[?DomainName=='$$DOMAIN'].CertificateArn | [0]" \
		--output text 2>/dev/null); \
	if [ "$$CERT_ARN" != "None" ] && [ -n "$$CERT_ARN" ]; then \
		aws acm describe-certificate --certificate-arn $$CERT_ARN --region us-east-1 \
			--query '[Certificate.Status, Certificate.DomainValidationOptions[0].ValidationStatus]' \
			--output table; \
	else \
		echo "No certificate found for $$DOMAIN"; \
	fi

# Setup commands
setup-env:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@echo "Please edit .env with your configuration"

setup-ecr:
	cd backend && ./scripts/setup-ecr-public.sh

setup-all: setup-env frontend-install backend-deps
	@echo "Setup completed! Edit .env files and run 'make backend-dev' and 'make frontend-dev'"

# Supabase commands
supabase-types:
	cd backend && supabase gen types typescript --local > types/supabase.ts

# Development shortcuts
dev: backend-dev
	@echo "Use 'make backend-dev' and 'make frontend-dev' in separate terminals"

# Clean everything
clean: backend-clean frontend-clean
	@echo "Cleaned all build artifacts"

# Install all dependencies
install: backend-deps frontend-install
	@echo "All dependencies installed"

# Route 53 Commands
route53-list-zones:
	@echo "Listing Route 53 hosted zones..."
	@aws route53 list-hosted-zones --output table

route53-find-zone:
	@if [ -z "$(DOMAIN)" ]; then echo "Usage: make route53-find-zone DOMAIN=example.com"; exit 1; fi
	@echo "Finding hosted zone for domain: $(DOMAIN)"
	@aws route53 list-hosted-zones --query "HostedZones[?Name=='$(DOMAIN).']" --output table

route53-list-records:
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	ZONE_ID=$$(cd infra && terraform output -raw route53_zone_id 2>/dev/null); \
	if [ -z "$$ZONE_ID" ]; then echo "Error: No Route 53 zone found. Run 'make infra-apply' first."; exit 1; fi; \
	echo "Listing records for zone $$ZONE_ID..."; \
	aws route53 list-resource-record-sets --hosted-zone-id $$ZONE_ID --output table

route53-test-dns:
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	APP_DOMAIN=$${DOMAIN_NAME:-shisha.toof.jp}; \
	API_DOMAIN=api.$${DOMAIN_NAME:-shisha.toof.jp}; \
	echo "Testing DNS resolution..."; \
	echo "App domain: $$APP_DOMAIN"; \
	dig +short $$APP_DOMAIN; \
	echo "API domain: $$API_DOMAIN"; \
	dig +short $$API_DOMAIN

# Database Migration Commands
db-migrate:
	@echo "Applying database migrations..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -z "$$DATABASE_URL" ]; then echo "Error: DATABASE_URL not set in .env"; exit 1; fi; \
	echo "Applying migrations to database..."; \
	for migration in backend/migrations/*.sql; do \
		if [[ "$$migration" != *"reset_and_apply"* ]] && [[ "$$migration" != *"archive"* ]]; then \
			echo "Applying $$migration..."; \
			psql "$$DATABASE_URL" -f "$$migration" || exit 1; \
		fi; \
	done; \
	echo "✓ Migrations applied successfully!"

db-reset:
	@echo "=== Resetting Database with New Schema ==="
	@echo "WARNING: This will DELETE ALL DATA!"
	@echo ""
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -z "$$DATABASE_URL" ]; then echo "Error: DATABASE_URL not set in .env"; exit 1; fi; \
	echo "This will reset the database and apply a fresh schema."; \
	echo "Type 'yes' to continue:"; \
	read CONFIRM; \
	if [ "$$CONFIRM" != "yes" ]; then echo "Operation cancelled"; exit 1; fi; \
	echo ""; \
	echo "Applying fresh schema..."; \
	cd backend/scripts && ./apply-unified-schema.sh

db-status:
	@echo "Checking database schema status..."
	@if [ -f .env ]; then export $$(grep -v '^#' .env | xargs); fi; \
	if [ -z "$$DATABASE_URL" ]; then echo "Error: DATABASE_URL not set in .env"; exit 1; fi; \
	echo "Database tables:"; \
	psql "$$DATABASE_URL" -c "\dt public.*" | grep -E "users|shisha_sessions|session_flavors|password_reset_tokens"; \
	echo ""; \
	echo "Session flavors columns:"; \
	psql "$$DATABASE_URL" -c "\d public.session_flavors" | grep -E "Column|flavor_order|--" || echo "Table not found"

# Backup Commands
backup-test:
	@echo "Testing backup Lambda function locally..."
	@cd infra/modules/backup && python3 -c "import os; os.environ.update({'DATABASE_URL': '${DATABASE_URL}', 'S3_BUCKET': 'test-bucket', 'PROJECT_NAME': 'shisha-log', 'ENVIRONMENT': 'test'}); from lambda_function import handler; print(handler({}, {}))"

backup-trigger:
	@echo "Manually triggering backup Lambda function..."
	@FUNCTION_NAME=$$(cd infra && terraform output -raw backup_lambda_function 2>/dev/null); \
	if [ -z "$$FUNCTION_NAME" ]; then echo "Error: Backup Lambda function not found. Run 'make infra-apply' first."; exit 1; fi; \
	aws lambda invoke \
		--function-name $$FUNCTION_NAME \
		--invocation-type Event \
		--cli-binary-format raw-in-base64-out \
		/tmp/backup-response.json; \
	echo "Backup triggered. Check CloudWatch logs for details."

backup-list:
	@echo "Listing recent backups..."
	@S3_BUCKET=$$(cd infra && terraform output -raw backup_s3_bucket 2>/dev/null); \
	if [ -z "$$S3_BUCKET" ]; then echo "Error: Backup S3 bucket not found. Run 'make infra-apply' first."; exit 1; fi; \
	aws s3 ls s3://$$S3_BUCKET/backups/ --recursive | sort -r | head -20

backup-download:
	@echo "Downloading latest backup..."
	@S3_BUCKET=$$(cd infra && terraform output -raw backup_s3_bucket 2>/dev/null); \
	if [ -z "$$S3_BUCKET" ]; then echo "Error: Backup S3 bucket not found. Run 'make infra-apply' first."; exit 1; fi; \
	LATEST_BACKUP=$$(aws s3 ls s3://$$S3_BUCKET/backups/ --recursive | sort -r | head -1 | awk '{print $$4}'); \
	if [ -z "$$LATEST_BACKUP" ]; then echo "Error: No backups found"; exit 1; fi; \
	echo "Downloading $$LATEST_BACKUP..."; \
	aws s3 cp s3://$$S3_BUCKET/$$LATEST_BACKUP ./; \
	echo "Backup downloaded: $$(basename $$LATEST_BACKUP)"
