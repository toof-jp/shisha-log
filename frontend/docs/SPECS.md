# Shisha Log Frontend Specifications

## Project Overview

Shisha Log Frontend is a React-based Single Page Application (SPA) for tracking and managing shisha (hookah) sessions. Users can register accounts, create profiles, and log their shisha experiences with detailed information about flavors, locations, and personal notes.

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context for authentication

## Features

### Authentication System
- User registration with user_id, password, and display name
- Login/logout functionality
- JWT token-based authentication
- Password change functionality
- Password reset flow
- Automatic profile creation upon registration

### Profile Management
- View and edit user profile
- Update display name, bio, and avatar URL
- Profile is automatically created during user registration

### Session Management
- Create new shisha sessions with:
  - Session date and time
  - Store/location name
  - Mix name
  - Multiple flavors with brands
  - Personal notes
  - Order details
- View all user sessions with pagination
- View detailed session information
- Edit existing sessions
- Delete sessions

### User Interface
- Responsive design using Tailwind CSS
- Protected routes requiring authentication
- Loading states and error handling
- Clean and intuitive navigation

## API Integration

The frontend integrates with the Shisha Log Backend API (localhost:8080/api/v1) with the following endpoints:

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Profile Endpoints (Protected)
- `GET /profile` - Get user profile
- `POST /profile` - Create user profile (auto-created on registration)
- `PUT /profile` - Update user profile

### Session Endpoints (Protected)
- `GET /sessions` - Get user sessions with pagination
- `GET /sessions/:id` - Get specific session
- `POST /sessions` - Create new session
- `PUT /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session

## Data Models

### User
```typescript
interface User {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}
```

### Profile
```typescript
interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Session
```typescript
interface Session {
  id: string;
  user_id: string;
  created_by: string;
  session_date: string;
  store_name: string;
  mix_name: string;
  flavors: Flavor[];
  notes?: string;
  order_details?: string;
  created_at: string;
  updated_at: string;
}
```

### Flavor
```typescript
interface Flavor {
  id: string;
  session_id: string;
  flavor_name: string;
  brand: string;
  created_at: string;
}
```

## Validation Requirements

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### User ID Requirements
- Minimum 3 characters
- Maximum 30 characters
- Must be unique

## Security Features

- JWT tokens stored in localStorage
- Automatic token attachment to API requests
- Token expiration handling with redirect to login
- Protected routes with authentication guards
- Input validation and sanitization

## Environment Configuration

- `VITE_API_BASE_URL` - Backend API base URL (defaults to http://localhost:8080/api/v1)

## Development Workflow

1. User registers account → Profile automatically created
2. User logs in → Receives JWT token
3. User can create, view, edit, and delete shisha sessions
4. User can manage their profile information
5. All data is persisted via backend API

## Build and Deployment

### Development Commands
```bash
# From project root
make frontend-install     # Install dependencies
make frontend-dev        # Start development server
make frontend-build      # Build for production
make frontend-lint       # Run linter
make frontend-typecheck  # Check TypeScript types
```

### Deployment Commands
```bash
# Deploy to S3/CloudFront (requires AWS credentials)
export S3_BUCKET_NAME=your-bucket-name
export CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
make deploy-frontend

# Deploy both frontend and backend
make deploy-all
```

### Infrastructure
The frontend is deployed as a static site using:
- **S3**: Static file hosting
- **CloudFront**: Global CDN with HTTPS
- **Unified Domain**: Shares domain with backend (e.g., shisha.example.com)
  - Frontend: https://shisha.example.com/
  - API: https://shisha.example.com/api/v1/

## Error Handling

- Network errors with user-friendly messages
- Form validation with field-specific errors
- Authentication errors with automatic logout
- Loading states during API operations
- Graceful fallbacks for missing data