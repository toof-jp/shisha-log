# OpenAPI/Swagger Documentation

This project uses Swagger/OpenAPI for API documentation.

## Accessing Swagger UI

When the backend server is running, you can access the Swagger UI at:
- Development: http://localhost:8080/swagger/index.html
- Production: https://api.shisha.toof.jp/swagger/index.html

## Generating Documentation

To regenerate the Swagger documentation after making changes to API annotations:

```bash
# From project root
make backend-swagger

# Or directly in backend directory
cd backend
swag init -g cmd/server/main.go
```

## Adding Swagger Annotations

Example of adding Swagger annotations to a handler:

```go
// CreateSession godoc
// @Summary Create a new session
// @Description Create a new shisha session
// @Tags sessions
// @Accept json
// @Produce json
// @Security Bearer
// @Param session body models.SessionInsert true "Session data"
// @Success 200 {object} models.Session
// @Failure 400 {object} object{error=string}
// @Router /sessions [post]
func (h *SessionHandler) CreateSession(c echo.Context) error {
    // Implementation
}
```

## Common Annotations

- `@Summary`: Short description (appears in endpoint list)
- `@Description`: Detailed description
- `@Tags`: Groups endpoints together
- `@Accept`: Request content type (usually `json`)
- `@Produce`: Response content type (usually `json`)
- `@Security Bearer`: Indicates JWT authentication required
- `@Param`: Describes request parameters
- `@Success`: Success response format
- `@Failure`: Error response format
- `@Router`: API endpoint path and HTTP method

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

You can obtain a token by calling the `/auth/login` endpoint with valid credentials.