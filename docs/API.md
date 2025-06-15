# Shisha Log API Documentation

## Base URL

**Development**
```
http://localhost:8080/api/v1
```

**Production**
```
https://api.shisha.toof.jp/api/v1
```

## Authentication

The API uses user ID and password-based authentication with JWT tokens. All protected endpoints require authentication using a JWT token obtained through the login flow.

### Headers
```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Registration**: New users register with user_id and password
2. **Login**: Users authenticate using user_id and password
3. **Token**: Upon successful authentication, users receive a JWT token
4. **API Access**: Use the JWT token in the Authorization header for protected endpoints

## Endpoints

### Authentication Endpoints

#### Register
```
POST /api/v1/auth/register
```

Creates a new user account with user_id and password.

**Request Body**
```json
{
  "user_id": "johndoe",
  "password": "SecurePassword123!"
}
```

**Response**
```json
{
  "user": {
    "id": "user-uuid",
    "user_id": "johndoe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token",
  "message": "Registration successful"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**User ID Requirements:**
- Minimum 3 characters
- Maximum 30 characters
- Must be unique

#### Login
```
POST /api/v1/auth/login
```

Authenticates a user with user_id and password.

**Request Body**
```json
{
  "user_id": "johndoe",
  "password": "SecurePassword123!"
}
```

**Response**
```json
{
  "user": {
    "id": "user-uuid",
    "user_id": "johndoe",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token"
}
```

#### Request Password Reset
```
POST /api/v1/auth/request-password-reset
```

Requests a password reset token for the specified user ID.

**Request Body**
```json
{
  "user_id": "johndoe"
}
```

**Response**
```json
{
  "message": "If the user ID exists, a reset token has been generated",
  "reset_token": "reset-token"
}
```

#### Reset Password
```
POST /api/v1/auth/reset-password
```

Resets the user's password using a valid reset token.

**Request Body**
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePassword123!"
}
```

**Response**
```json
{
  "message": "Password reset successfully"
}
```

#### Change Password (Protected)
```
POST /api/v1/auth/change-password
```

Changes the password for the authenticated user.

**Request Body**
```json
{
  "current_password": "CurrentPassword123!",
  "new_password": "NewSecurePassword123!"
}
```

**Response**
```json
{
  "message": "Password changed successfully"
}
```

### Session Endpoints (Protected)

#### Create Session
```
POST /api/v1/sessions
```

Creates a new shisha session.

**Request Body**

Note: The `flavors` array itself is optional. If provided, both `flavor_name` and `brand` fields within each flavor are optional. The `store_name`, `mix_name`, and `creator` fields are also optional.
```json
{
  "session_date": "2024-01-01T20:00:00Z",
  "store_name": "Cloud 9 Lounge",
  "mix_name": "Blueberry Mint Ice",
  "creator": "Ahmed",
  "flavors": [
    {
      "flavor_name": "Blueberry",
      "brand": "Al Fakher"
    },
    {
      "flavor_name": "Mint"
    },
    {
      "flavor_name": "Ice"
    }
  ],
  "notes": "Great mix, perfect balance",
  "order_details": "Bowl #3, Table 5"
}
```

**Minimal Request Body Example** (only required field):
```json
{
  "session_date": "2024-01-01T20:00:00Z"
}
```

**Response**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "created_by": "user-uuid",
  "session_date": "2024-01-01T20:00:00Z",
  "store_name": "Cloud 9 Lounge",
  "mix_name": "Blueberry Mint Ice",
  "creator": "Ahmed",
  "flavors": [
    {
      "id": "flavor-uuid",
      "session_id": "session-uuid",
      "flavor_name": "Blueberry",
      "brand": "Al Fakher",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "flavor-uuid",
      "session_id": "session-uuid",
      "flavor_name": "Mint",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "flavor-uuid",
      "session_id": "session-uuid",
      "flavor_name": "Ice",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "notes": "Great mix, perfect balance",
  "order_details": "Bowl #3, Table 5",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Get User Sessions
```
GET /api/v1/sessions
```

Gets all sessions for the authenticated user.

**Query Parameters**
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Response**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "user_id": "user-uuid",
      "created_by": "user-uuid",
      "session_date": "2024-01-01T20:00:00Z",
      "store_name": "Cloud 9 Lounge",
      "mix_name": "Blueberry Mint Ice",
      "creator": "Ahmed",
      "flavors": [...],
      "notes": "Great mix, perfect balance",
      "order_details": "Bowl #3, Table 5",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### Get Session
```
GET /api/v1/sessions/:id
```

Gets a specific session by ID.

**Response**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "created_by": "user-uuid",
  "session_date": "2024-01-01T20:00:00Z",
  "store_name": "Cloud 9 Lounge",
  "mix_name": "Blueberry Mint Ice",
  "creator": "Ahmed",
  "flavors": [...],
  "notes": "Great mix, perfect balance",
  "order_details": "Bowl #3, Table 5",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update Session
```
PUT /api/v1/sessions/:id
```

Updates a specific session.

**Request Body**
```json
{
  "session_date": "2024-01-01T21:00:00Z",
  "store_name": "Cloud 9 Lounge Updated",
  "mix_name": "Blueberry Mint Ice Extra",
  "creator": "Mohammed",
  "notes": "Even better with ice",
  "order_details": "Bowl #3, Table 5, Extra ice"
}
```

**Response**
```json
{
  "id": "session-uuid",
  "user_id": "user-uuid",
  "created_by": "user-uuid",
  "session_date": "2024-01-01T21:00:00Z",
  "store_name": "Cloud 9 Lounge Updated",
  "mix_name": "Blueberry Mint Ice Extra",
  "creator": "Mohammed",
  "flavors": [...],
  "notes": "Even better with ice",
  "order_details": "Bowl #3, Table 5, Extra ice",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Delete Session
```
DELETE /api/v1/sessions/:id
```

Deletes a specific session.

**Response**
```json
{
  "message": "Session deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## CORS

The API supports CORS for web applications. Configure allowed origins in the server environment variables.