# Shisha Log Backend

Backend service for the Shisha Log application.

## Requirements

- Go 1.21+
- PostgreSQL database (via Supabase)
- Air for hot reload (optional)

## Quick Start

From the project root:

```bash
# Install dependencies
make backend-deps

# Run with hot reload
make backend-dev

# Run tests
make backend-test

# Build
make backend-build
```

## API Documentation

See [API.md](../API.md) in the root directory for complete API documentation.

## Authentication

The application uses JWT-based authentication with user ID and password.

### Authentication Flow
1. **Registration**: Users register with user_id, password, and display name
2. **Login**: Users authenticate with user_id and password
3. **Token**: Upon successful authentication, users receive a JWT token
4. **API Access**: Use the JWT token in the Authorization header for protected endpoints

```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
.
├── cmd/
│   └── server/         # Application entrypoint
├── internal/
│   ├── api/           # HTTP handlers
│   ├── auth/          # Authentication middleware
│   ├── config/        # Configuration management
│   ├── models/        # Data models
│   ├── repository/    # Database access layer
│   └── service/       # Business logic services
├── pkg/              # Reusable packages
└── supabase/         # Supabase migrations and config
```