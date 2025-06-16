package main

import (
	"database/sql"
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
	"github.com/supabase-community/supabase-go"
	"github.com/toof-jp/shisha-log/backend/internal/api"
	"github.com/toof-jp/shisha-log/backend/internal/auth"
	"github.com/toof-jp/shisha-log/backend/internal/config"
	"github.com/toof-jp/shisha-log/backend/internal/repository"
	"github.com/toof-jp/shisha-log/backend/internal/service"
	"github.com/toof-jp/shisha-log/backend/internal/version"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize database connection
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Initialize Supabase client (still needed for existing functionality)
	supabaseClient, err := supabase.NewClient(cfg.SupabaseURL, cfg.SupabaseServiceRole, nil)
	if err != nil {
		log.Fatal("Failed to create Supabase client:", err)
	}

	// Initialize services
	jwtService := service.NewJWTService(cfg)
	passwordService := service.NewPasswordService()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(supabaseClient)

	// Initialize handlers
	authHandler := api.NewAuthHandler(userRepo, passwordService, jwtService)
	sessionHandler := api.NewSessionHandler(sessionRepo)

	// Initialize auth middleware
	authMiddleware := auth.NewAuthMiddleware(jwtService)

	// Create Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Configure CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: cfg.AllowedOrigins,
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	// Health check
	e.GET("/health", func(c echo.Context) error {
		response := map[string]interface{}{
			"status":  "ok",
			"version": version.Info(),
		}
		return c.JSON(200, response)
	})

	// API routes
	apiGroup := e.Group("/api/v1")

	// API health check
	apiGroup.GET("/health", func(c echo.Context) error {
		response := map[string]interface{}{
			"status":  "ok",
			"version": version.Info(),
		}
		return c.JSON(200, response)
	})

	// Auth routes (public)
	authGroup := apiGroup.Group("/auth")
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)
	authGroup.POST("/request-password-reset", authHandler.RequestPasswordReset)
	authGroup.POST("/reset-password", authHandler.ResetPassword)

	// Protected auth routes
	protectedAuth := authGroup.Group("")
	protectedAuth.Use(authMiddleware.Authenticate)
	protectedAuth.POST("/change-password", authHandler.ChangePassword)

	// Protected routes
	protected := apiGroup.Group("")
	protected.Use(authMiddleware.Authenticate)

	// User routes
	protected.GET("/users/me", authHandler.GetCurrentUser)

	// Session routes
	protected.POST("/sessions", sessionHandler.CreateSession)
	protected.GET("/sessions", sessionHandler.GetUserSessions)
	protected.GET("/sessions/calendar", sessionHandler.GetCalendarData)
	protected.GET("/sessions/:id", sessionHandler.GetSession)
	protected.PUT("/sessions/:id", sessionHandler.UpdateSession)
	protected.DELETE("/sessions/:id", sessionHandler.DeleteSession)

	// Flavor statistics route
	protected.GET("/flavors/stats", sessionHandler.GetFlavorStats)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
