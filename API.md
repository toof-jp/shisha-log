# Shisha Log API Documentation

Base URL: `https://api.shisha.toof.jp/api/v1`

## Authentication

All endpoints except registration and login require authentication via JWT token in the Authorization header.

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "user_id": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "user_id": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "user_id": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "token": "jwt_token"
}
```

#### POST /auth/change-password
Change password for the authenticated user.

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### Sessions

#### GET /sessions
Get all sessions for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 20)
- `offset` (optional): Number of sessions to skip (default: 0)

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "created_by": "uuid",
      "session_date": "2024-01-01T00:00:00Z",
      "store_name": "string",
      "mix_name": "string",
      "creator": "string",
      "flavors": [
        {
          "id": "uuid",
          "session_id": "uuid",
          "flavor_name": "string",
          "brand": "string",
          "flavor_order": 0,
          "created_at": "datetime"
        }
      ],
      "notes": "string",
      "order_details": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

#### POST /sessions
Create a new session.

**Request Body:**
```json
{
  "session_date": "2024-01-01T00:00:00Z",
  "store_name": "string",
  "mix_name": "string",
  "creator": "string",
  "flavors": [
    {
      "flavor_name": "string",
      "brand": "string",
      "flavor_order": 0
    }
  ],
  "notes": "string",
  "order_details": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "created_by": "uuid",
  "session_date": "2024-01-01T00:00:00Z",
  "store_name": "string",
  "mix_name": "string",
  "creator": "string",
  "flavors": [...],
  "notes": "string",
  "order_details": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### GET /sessions/:id
Get a specific session by ID.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "created_by": "uuid",
  "session_date": "2024-01-01T00:00:00Z",
  "store_name": "string",
  "mix_name": "string",
  "creator": "string",
  "flavors": [...],
  "notes": "string",
  "order_details": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### PUT /sessions/:id
Update a session.

**Request Body:**
```json
{
  "session_date": "2024-01-01T00:00:00Z",
  "store_name": "string",
  "mix_name": "string",
  "creator": "string",
  "flavors": [...],
  "notes": "string",
  "order_details": "string"
}
```

**Response:** Updated session object

#### DELETE /sessions/:id
Delete a session.

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

#### GET /sessions/calendar
Get calendar data showing session counts by date.

**Query Parameters:**
- `year` (required): Year (e.g., 2024)
- `month` (required): Month (1-12)
- `timezone` (optional): IANA timezone (e.g., "Asia/Tokyo", default: "UTC")

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "count": 3
  },
  {
    "date": "2024-01-02",
    "count": 1
  }
]
```

#### GET /sessions/by-date
Get all sessions for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `timezone` (optional): IANA timezone (e.g., "Asia/Tokyo", default: "UTC")

**Response:**
```json
{
  "sessions": [...],
  "date": "2024-01-01"
}
```

### Flavor Statistics

#### GET /flavors/stats
Get flavor usage statistics for the authenticated user.

**Response:**
```json
{
  "main_flavors": [
    {
      "flavor_name": "string",
      "count": 10
    }
  ],
  "all_flavors": [
    {
      "flavor_name": "string",
      "count": 15
    }
  ]
}
```

### Store Statistics

#### GET /stores/stats
Get store visit statistics for the authenticated user.

**Response:**
```json
{
  "stores": [
    {
      "store_name": "string",
      "count": 10
    }
  ]
}
```

### Creator Statistics

#### GET /creators/stats
Get creator (mix maker) statistics for the authenticated user.

**Response:**
```json
{
  "creators": [
    {
      "creator": "string",
      "count": 10
    }
  ]
}
```

### User

#### GET /users/me
Get current user information.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "ok",
  "version": {
    "git_commit": "abc123",
    "build_time": "2024-01-01T00:00:00Z",
    "version": "v1.0.0"
  }
}
```

### Demo Mode

#### GET /demo
Access demo mode with sample data. No authentication required.

**Features:**
- Displays 50 pre-generated demo sessions
- Sessions are spread over the past 60 days
- Includes various Japanese store names, creator names, and flavor combinations
- Shows full statistics (calendar view, flavor stats, store stats, creator stats)
- Demo banner at top with link to login page
- All features are read-only in demo mode

**Response:**
The demo route serves the frontend application with demo data pre-loaded. Users can:
- View the calendar with demo sessions
- Browse through 50 sample sessions
- View flavor statistics and rankings
- View store visit statistics
- View creator/mixer statistics
- Click on calendar dates to see sessions for that day

**Note:** Demo data is generated dynamically but consistently, showing realistic usage patterns with Japanese store names (e.g., "シーシャバー 渋谷", "煙草屋 新宿") and various flavor combinations.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error