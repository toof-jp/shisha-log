package config

import (
	"errors"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	Environment         string
	SupabaseURL         string
	SupabaseAnonKey     string
	SupabaseServiceRole string
	JWTSecret           string
	AllowedOrigins      []string
	DatabaseURL         string
	OTLPEndpoint        string
	TokenDuration       string
}

func LoadConfig() (*Config, error) {
	// Try to load from parent directory first (for air hot reload)
	if err := godotenv.Load("../.env"); err != nil {
		// Try current directory (for normal execution)
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
	}

	config := &Config{
		Port:                getEnv("PORT", "8080"),
		Environment:         getEnv("ENVIRONMENT", "development"),
		SupabaseURL:         getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey:     getEnv("SUPABASE_ANON_KEY", ""),
		SupabaseServiceRole: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		DatabaseURL:         getEnv("DATABASE_URL", ""),
		OTLPEndpoint:        getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318"),
		TokenDuration:       getEnv("TOKEN_DURATION", "24h"),
	}

	allowedOrigins := getEnv("ALLOWED_ORIGINS", "http://localhost:3000")
	config.AllowedOrigins = strings.Split(allowedOrigins, ",")

	// An empty secret would make every JWT trivially forgeable.
	if config.JWTSecret == "" {
		return nil, errors.New("JWT_SECRET must be set")
	}
	if len(config.JWTSecret) < 32 {
		log.Println("WARNING: JWT_SECRET is shorter than 32 bytes; use a longer random secret")
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
