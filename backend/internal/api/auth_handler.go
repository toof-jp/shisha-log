package api

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/toof-jp/shisha-log/backend/internal/repository"
	"github.com/toof-jp/shisha-log/backend/internal/service"
)

type AuthHandler struct {
	userRepo        *repository.UserRepository
	passwordService *service.PasswordService
	jwtService      *service.JWTService
}

func NewAuthHandler(
	userRepo *repository.UserRepository,
	passwordService *service.PasswordService,
	jwtService *service.JWTService,
) *AuthHandler {
	return &AuthHandler{
		userRepo:        userRepo,
		passwordService: passwordService,
		jwtService:      jwtService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c echo.Context) error {
	var req struct {
		UserID   string `json:"user_id" validate:"required,min=3,max=30"`
		Password string `json:"password" validate:"required,min=8"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Validate password strength
	if err := h.passwordService.ValidatePasswordStrength(req.Password); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Check if user already exists
	_, err := h.userRepo.GetByUserID(req.UserID)
	if err == nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "User ID already exists"})
	}

	// Hash password
	passwordHash, err := h.passwordService.HashPassword(req.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to process password"})
	}

	// Create user
	user, err := h.userRepo.Create(req.UserID, passwordHash)
	if err != nil {
		// Log the actual error for debugging
		c.Logger().Errorf("Failed to create user: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user", "details": err.Error()})
	}

	// Generate JWT token
	token, err := h.jwtService.GenerateToken(user.ID.String())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"user":    user,
		"token":   token,
		"message": "Registration successful",
	})
}

// Login handles user login
func (h *AuthHandler) Login(c echo.Context) error {
	var req struct {
		UserID   string `json:"user_id" validate:"required"`
		Password string `json:"password" validate:"required"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Get user by user_id
	user, err := h.userRepo.GetByUserID(req.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid user ID or password"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user"})
	}

	// Verify password
	if err := h.passwordService.VerifyPassword(req.Password, user.PasswordHash); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid user ID or password"})
	}

	// Generate JWT token
	token, err := h.jwtService.GenerateToken(user.ID.String())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

// RequestPasswordReset handles password reset requests
func (h *AuthHandler) RequestPasswordReset(c echo.Context) error {
	var req struct {
		UserID string `json:"user_id" validate:"required"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Get user by user_id
	user, err := h.userRepo.GetByUserID(req.UserID)
	if err != nil {
		// Don't reveal if user ID exists
		return c.JSON(http.StatusOK, map[string]string{"message": "If the user ID exists, a reset token has been generated"})
	}

	// Generate reset token
	resetToken, err := h.passwordService.GenerateToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate reset token"})
	}

	// Store reset token
	expiresAt := time.Now().Add(1 * time.Hour)
	if err := h.userRepo.CreatePasswordResetToken(user.ID, resetToken, expiresAt); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create reset token"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message":     "If the user ID exists, a reset token has been generated",
		"reset_token": resetToken, // In production, this would be sent via secure channel
	})
}

// ResetPassword handles password reset
func (h *AuthHandler) ResetPassword(c echo.Context) error {
	var req struct {
		Token       string `json:"token" validate:"required"`
		NewPassword string `json:"new_password" validate:"required,min=8"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Validate password strength
	if err := h.passwordService.ValidatePasswordStrength(req.NewPassword); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Get reset token
	resetToken, err := h.userRepo.GetPasswordResetToken(req.Token)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid or expired token"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to verify token"})
	}

	// Hash new password
	passwordHash, err := h.passwordService.HashPassword(req.NewPassword)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to process password"})
	}

	// Update password
	if err := h.userRepo.UpdatePassword(resetToken.UserID, passwordHash); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update password"})
	}

	// Mark token as used
	if err := h.userRepo.MarkPasswordResetTokenUsed(req.Token); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to mark token as used"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password reset successfully"})
}

// ChangePassword handles password change for authenticated users
func (h *AuthHandler) ChangePassword(c echo.Context) error {
	userID := c.Get("user_id").(string)
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	var req struct {
		CurrentPassword string `json:"current_password" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=8"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Validate new password strength
	if err := h.passwordService.ValidatePasswordStrength(req.NewPassword); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Get user
	user, err := h.userRepo.GetByID(userUUID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user"})
	}

	// Verify current password
	if err := h.passwordService.VerifyPassword(req.CurrentPassword, user.PasswordHash); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Current password is incorrect"})
	}

	// Hash new password
	newPasswordHash, err := h.passwordService.HashPassword(req.NewPassword)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to process password"})
	}

	// Update password
	if err := h.userRepo.UpdatePassword(userUUID, newPasswordHash); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update password"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password changed successfully"})
}

// GetCurrentUser returns the current authenticated user's information
func (h *AuthHandler) GetCurrentUser(c echo.Context) error {
	userID := c.Get("user_id").(string)
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	// Get user
	user, err := h.userRepo.GetByID(userUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user"})
	}

	return c.JSON(http.StatusOK, user)
}
