# Architecture Overview

## System Architecture

Shisha Log is a full-stack web application for tracking shisha (hookah) sessions, built with modern cloud-native technologies.

### High-Level Architecture

```
┌──────────────────────────────────────────────────┐
│                   Route 53 DNS                    │
│  shisha.toof.jp (A) ──► CloudFront              │
│  api.shisha.toof.jp (A) ──► Lightsail IP        │
└──────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
          ┌─────────────────┐   ┌─────────────────┐
          │   CloudFront    │   │    Lightsail    │
          │  Distribution   │   │    Instance     │
          └────────┬────────┘   └────────┬────────┘
                   │                      │
                   ▼                      ▼
            ┌──────────────┐       ┌─────────────┐
            │  S3 Bucket   │       │ Go Backend  │
            │ (React SPA)  │       │  (Docker)   │
            └──────────────┘       └──────┬──────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │   Supabase   │
                                   │ (PostgreSQL) │
                                   └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **State Management**: React Query (TanStack Query)

### Backend
- **Language**: Go 1.21+
- **Web Framework**: Echo v4
- **Authentication**: JWT (user_id + password)
- **Database**: PostgreSQL (via Supabase)
- **Container**: Docker
- **API Documentation**: OpenAPI/Swagger

### Infrastructure
- **Cloud Provider**: AWS
- **CDN**: CloudFront
- **Static Hosting**: S3
- **Compute**: Lightsail
- **Container Registry**: ECR Public
- **IaC**: Terraform
- **SSL**: ACM (CloudFront) + Let's Encrypt (Lightsail)

## Application Components

### Frontend Structure

```
frontend/
├── app/
│   ├── routes/          # Page components
│   │   ├── home.tsx     # Landing page
│   │   ├── login.tsx    # User authentication
│   │   ├── signup.tsx   # User registration
│   │   ├── profile.tsx  # User profile management
│   │   └── sessions/    # Session CRUD operations
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.ts  # Authentication state
│   │   └── api/         # API hooks (React Query)
│   ├── lib/             # Utilities
│   │   ├── api-client.ts # Axios configuration
│   │   └── auth-api.ts  # Auth API functions
│   └── components/      # Reusable UI components
```

### Backend Structure

```
backend/
├── cmd/server/          # Application entry point
├── internal/
│   ├── api/             # HTTP handlers
│   │   ├── auth_handler.go     # Authentication endpoints
│   │   ├── profile_handler.go  # Profile CRUD
│   │   └── session_handler.go  # Session CRUD
│   ├── auth/            # Authentication middleware
│   ├── config/          # Configuration management
│   ├── models/          # Data models
│   ├── repository/      # Database access layer
│   └── service/         # Business logic
│       ├── jwt_service.go      # JWT token handling
│       └── password_service.go # Password hashing
```

## Data Flow

### Authentication Flow

1. **Registration**:
   ```
   Client → POST /api/v1/auth/register
   → Validate password strength
   → Hash password (bcrypt)
   → Create user record
   → Auto-create profile
   → Return JWT token
   ```

2. **Login**:
   ```
   Client → POST /api/v1/auth/login
   → Verify credentials
   → Generate JWT token
   → Return user data + token
   ```

3. **Authenticated Requests**:
   ```
   Client → Request with Authorization: Bearer <token>
   → JWT middleware validates token
   → Extract user context
   → Process request
   ```

### API Request Flow

```
CloudFront → Lightsail → Nginx → Go Backend → Supabase
    ↑                                              ↓
    └──────────── Response ←──────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Users table (authentication)
users
├── id (UUID, PK)
├── user_id (TEXT, UNIQUE)
├── password_hash (TEXT)
├── display_name (TEXT)
└── timestamps

-- Profiles table (user details)
profiles
├── id (UUID, PK, FK → users.id)
├── display_name (TEXT)
└── timestamps

-- Shisha sessions
shisha_sessions
├── id (UUID, PK)
├── user_id (UUID, FK → users.id)
├── session_date (TIMESTAMPTZ)
├── store_name (TEXT)
├── notes (TEXT)
├── order_details (TEXT)
├── mix_name (TEXT)
└── timestamps

-- Session flavors (many-to-many)
session_flavors
├── id (UUID, PK)
├── session_id (UUID, FK → shisha_sessions.id)
├── flavor_name (TEXT)
├── brand (TEXT)
└── created_at
```

## Deployment Architecture

### Production Environment

```
AWS Account
├── us-east-1 (Global Services)
│   └── ACM Certificate (for CloudFront)
│
└── ap-northeast-1 (Primary Region)
    ├── CloudFront Distribution
    │   ├── Origin 1: S3 Bucket (Frontend)
    │   └── Origin 2: Lightsail Instance (Backend)
    ├── S3 Bucket
    │   └── React Build Artifacts
    └── Lightsail Instance
        ├── Docker Container (Go API)
        ├── Nginx Reverse Proxy
        └── Let's Encrypt SSL
```

### Path-Based Routing

CloudFront behaviors:
- `/api/*` → Lightsail backend (no caching)
- `/health` → Lightsail health check (no caching)
- `/*` → S3 frontend (cached)

### Environment Configuration

Environment variables are managed through:
- `.env` file (consolidated for all services)
- Loaded by backend via godotenv
- Injected into frontend build via Vite

## Security Considerations

### Authentication & Authorization
- JWT tokens with configurable expiration (default: 24h)
- Bcrypt password hashing (cost factor: 14)
- User ID + password authentication
- Bearer token in Authorization header

### Network Security
- HTTPS enforced via CloudFront
- Lightsail security groups restrict access
- S3 bucket private (CloudFront OAC only)
- CORS configured for specific origins

### Data Protection
- Sensitive data never logged
- Environment variables for secrets
- No credentials in code or version control
- Prepared statements prevent SQL injection

## Performance Optimizations

### Frontend
- Vite build optimization
- React lazy loading for routes
- CloudFront caching for static assets
- Gzip compression enabled

### Backend
- Database connection pooling
- Efficient SQL queries with indexes
- Docker multi-stage builds
- Nginx caching headers

### Infrastructure
- CloudFront edge locations
- S3 Transfer Acceleration
- Lightsail instance auto-recovery
- Health checks for availability

## Monitoring & Operations

### Health Checks
- `/api/v1/health` - Backend health
- CloudFront origin health checks
- Lightsail instance monitoring

### Logging
- CloudFront access logs
- Nginx access/error logs
- Application logs via journald
- Structured JSON logging

### Deployment
- GitHub Actions CI/CD pipeline
- Terraform state management
- Blue-green deployments possible
- Rollback via container tags

## Future Considerations

### Scalability
- Consider ECS/Fargate for auto-scaling
- RDS for managed database
- ElastiCache for session management
- Lambda@Edge for dynamic content

### Features
- WebSocket for real-time updates
- Image uploads for sessions
- Social features (sharing, following)
- Mobile application

### Technical Debt
- Add comprehensive test coverage
- Implement API rate limiting
- Add request tracing (OpenTelemetry)
- Enhance error handling and recovery