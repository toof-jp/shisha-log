# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shisha Log is a full-stack application for tracking and managing shisha (hookah) sessions. The project consists of:
- **Backend**: Go-based REST API using Echo framework
- **Frontend**: React SPA with TypeScript and Vite
- **Database**: PostgreSQL managed through Supabase
- **Infrastructure**: AWS Lightsail deployment with Terraform

## Development Commands

**Important**: All commands should be run from the project root directory. The Makefile handles directory navigation automatically.

### Backend (from root directory)
- **Install dependencies**: `make backend-deps`
- **Run development server**: `make backend-dev` (with hot reload) or `make backend-run`
- **Run tests**: `make backend-test`
- **Linting/formatting**: `make backend-fmt && make backend-lint`
- **Build production**: `make backend-build`

### Frontend (from root directory)
- **Install dependencies**: `make frontend-install`
- **Start development**: `make frontend-dev`
- **Build production**: `make frontend-build`
- **Type check**: `make frontend-typecheck` or `make typecheck`
- **Lint**: `make frontend-lint`

### Convenience Commands
- **Build both frontend and backend**: `make build`
- **Type check (alias)**: `make typecheck`
- **Deploy frontend**: `make deploy-frontend`
- **Deploy backend**: `make deploy-backend`
- **Deploy all**: `make deploy-all`

### Infrastructure
- **Initialize**: `make infra-init`
- **Plan changes**: `make infra-plan`
- **Apply changes**: `make infra-apply`

## Architecture Overview

### Backend Architecture
- **Framework**: Echo (Go web framework)
- **Authentication**: JWT-based with user ID + password
- **Database Access**: 
  - Direct PostgreSQL connection for authentication data
  - Supabase client for application data (sessions, profiles)
- **API Design**: RESTful API at `/api/v1`
- **Key packages**:
  - `internal/api/` - HTTP handlers
  - `internal/auth/` - Authentication middleware
  - `internal/models/` - Data models
  - `internal/repository/` - Database access
  - `internal/service/` - Business logic

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **API Client**: Axios with automatic JWT handling
- **Key directories**:
  - `app/routes/` - Page components
  - `app/hooks/` - Custom React hooks
  - `app/lib/` - API client and utilities
  - `app/types/` - TypeScript interfaces
- **Dashboard Features**:
  - Tab-based interface (Calendar view and Statistics view)
  - Calendar component showing daily session counts
  - Flavor statistics with charts and rankings

### Database Schema

#### Authentication Tables
- **users**: User accounts (id, user_id, password_hash, display_name)
- **password_reset_tokens**: Password reset flow

#### Application Tables
- **profiles**: User profiles linked to users
- **shisha_sessions**: Session records with store, notes, order details
- **session_flavors**: Flavors used in each session

## Environment Configuration

Single `.env` file in the project root contains all configuration:

```
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1  # Development
# VITE_API_BASE_URL=https://api.shisha.toof.jp/api/v1  # Production

# Backend Server Configuration  
PORT=8080
ENVIRONMENT=development

# Supabase Configuration
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>

# JWT Configuration
JWT_SECRET=<your-jwt-secret>
TOKEN_DURATION=24h

# Database Configuration
DATABASE_URL=<postgresql-connection-string>

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173
```

### Setup
```bash
# Copy example file
make setup-env

# This creates .env from .env.example
# Edit .env with your configuration values
```

## Key Development Notes

- **Working Directory**: Always work from the project root directory. Use make commands instead of cd-ing into subdirectories
- **Authentication Flow**: Users register with user_id/password, receive JWT token, profile auto-created
- **API Integration**: All non-auth endpoints require JWT in Authorization header
- **CORS**: Backend configured to accept requests from frontend origins
- **SSL/HTTPS**: Frontend dev server uses self-signed certificates for localhost
- **Database Migrations**: Managed through Supabase CLI (`supabase db push`)
- **Deployment**: Uses Docker containers deployed to AWS Lightsail via GitHub Actions

## Supabase Integration

- Install CLI: `npm install -g supabase`
- Link project: `supabase link --project-ref <project-ref>`
- Run migrations: `supabase db push`
- Generate types: `supabase gen types typescript --local > types/supabase.ts`

## Testing Approach

- Backend: Go standard testing with `go test`
- Frontend: Component testing can be added with Vitest
- API testing: Use mock data and test handlers independently