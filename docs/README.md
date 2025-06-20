# Shisha Log Documentation

Welcome to the Shisha Log documentation. This directory contains comprehensive guides for understanding, developing, and deploying the application.

## Documentation Structure

### Core Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, technology stack, and design decisions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide including infrastructure, CI/CD, and operations
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Local development setup and workflow
- **[INFRASTRUCTURE.md](./INFRASTRUCTURE.md)** - AWS infrastructure components and backup system
- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly with the application
- **[SPEC.md](./SPEC.md)** - Product specification and feature documentation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### Infrastructure & DevOps

- **[ROUTE53_DNS_SETUP.md](./ROUTE53_DNS_SETUP.md)** - Route 53 DNS configuration and management
- **[backend/ECR_PUBLIC_SETUP.md](./backend/ECR_PUBLIC_SETUP.md)** - AWS ECR Public registry setup
- **[backend/ECR_ALIAS_SETUP.md](./backend/ECR_ALIAS_SETUP.md)** - How to find your ECR alias
- **[backend/SSL_AUTOMATION.md](./backend/SSL_AUTOMATION.md)** - SSL certificate automation for Lightsail

## Quick Links

### For Developers
1. Start with [QUICK_START.md](./QUICK_START.md) to get the application running
2. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for the development workflow
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design

### For DevOps/Deployment
1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions
2. Configure DNS using [ROUTE53_DNS_SETUP.md](./ROUTE53_DNS_SETUP.md)
3. Set up container registry with [backend/ECR_PUBLIC_SETUP.md](./backend/ECR_PUBLIC_SETUP.md)

### For Troubleshooting
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review deployment logs and monitoring sections in [DEPLOYMENT.md](./DEPLOYMENT.md)

## Key Concepts

### Unified Domain Architecture
The application uses a single domain with path-based routing:
- Frontend: `https://shisha.example.com`
- Backend API: `https://shisha.example.com/api/*`

This is achieved through CloudFront distribution with multiple origins.

### Authentication
The application uses JWT-based authentication with user ID and password (not passkeys/WebAuthn).

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Go + Echo framework
- **Database**: PostgreSQL (Supabase)
- **Infrastructure**: AWS (CloudFront, S3, Lightsail)
- **IaC**: Terraform

## Contributing to Documentation

When updating documentation:
1. Keep information accurate and up-to-date with the codebase
2. Include practical examples and commands
3. Add troubleshooting sections for common issues
4. Cross-reference related documents
5. Test all commands and procedures before documenting

## API Documentation

- Backend API documentation is available at `/api/v1/docs` when the server is running
- API specification is maintained in the root directory as `API.md`