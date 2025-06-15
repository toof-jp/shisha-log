package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/toof-jp/shisha-log/backend/internal/models"
	"github.com/toof-jp/shisha-log/backend/internal/repository"
)

type ProfileHandler struct {
	repo *repository.ProfileRepository
}

func NewProfileHandler(repo *repository.ProfileRepository) *ProfileHandler {
	return &ProfileHandler{repo: repo}
}

func (h *ProfileHandler) GetProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)

	profile, err := h.repo.GetByID(c.Request().Context(), userID)
	if err != nil {
		if err.Error() == "profile not found" {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Profile not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get profile"})
	}

	return c.JSON(http.StatusOK, profile)
}

func (h *ProfileHandler) CreateProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req struct {
		DisplayName string `json:"display_name" validate:"required"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	profile := &models.Profile{
		ID:          userID,
		DisplayName: req.DisplayName,
	}

	if err := h.repo.Create(c.Request().Context(), profile); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create profile"})
	}

	return c.JSON(http.StatusCreated, profile)
}

func (h *ProfileHandler) UpdateProfile(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req struct {
		DisplayName string `json:"display_name" validate:"required"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if err := h.repo.Update(c.Request().Context(), userID, req.DisplayName); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update profile"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Profile updated successfully"})
}
