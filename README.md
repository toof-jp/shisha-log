# Shisha Log

A full-stack application for tracking and managing shisha (hookah) sessions.

## Project Structure

```
shisha-log/
├── backend/               # Go backend API
├── frontend/              # React frontend SPA
├── infra/                 # Terraform infrastructure
├── docs/                  # Documentation
├── .env                  # All environment variables (frontend + backend)
├── .env.example          # Example configuration
└── Makefile              # Project commands
```

## Quick Start

1. **Setup environment files**
   ```bash
   make setup-env
   # Edit .env with your configuration
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Run development servers**
   ```bash
   # In separate terminals:
   make backend-dev    # Backend on http://localhost:8080
   make frontend-dev   # Frontend on https://localhost:5173
   ```

## Available Commands

Run `make help` to see all available commands:

- **Development**: `backend-dev`, `frontend-dev`
- **Build**: `backend-build`, `frontend-build`
- **Deploy**: `deploy-frontend`, `deploy-backend`, `deploy-all`
- **Infrastructure**: `infra-init`, `infra-apply`, `infra-unified-apply`

## Environment Files

Single environment file in the project root:
- `.env` - All configuration (frontend VITE_* and backend settings)
- `.env.example` - Example configuration with all required variables

## Deployment

The application uses separate domains for frontend and backend:
- **Frontend**: S3 + CloudFront (https://shisha.toof.jp)
- **Backend**: AWS Lightsail with Docker (https://api.shisha.toof.jp)
- **Database**: PostgreSQL via Supabase

See `docs/` for detailed deployment guides.

## Documentation

- [API Documentation](API.md)
- [Infrastructure Architecture](docs/INFRASTRUCTURE.md)
- [DNS Configuration Guide](docs/DNS_CONFIGURATION_GUIDE.md)
- [Frontend Specifications](frontend/docs/SPECS.md)
- [Backend Deployment](docs/backend/DEPLOYMENT.md)
- [Backend Setup Guides](docs/backend/)