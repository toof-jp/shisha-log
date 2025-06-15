package api

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/toof-jp/shisha-log/backend/internal/models"
	"github.com/toof-jp/shisha-log/backend/internal/repository"
)

type SessionHandler struct {
	repo *repository.SessionRepository
}

func NewSessionHandler(repo *repository.SessionRepository) *SessionHandler {
	return &SessionHandler{repo: repo}
}

func (h *SessionHandler) CreateSession(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req models.CreateSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Always use the authenticated user's ID
	session := &models.ShishaSession{
		UserID:       userID,
		CreatedBy:    userID,
		SessionDate:  req.SessionDate,
		StoreName:    req.StoreName,
		Notes:        req.Notes,
		OrderDetails: req.OrderDetails,
		MixName:      req.MixName,
		Creator:      req.Creator,
	}

	// Handle optional flavors
	var flavors []models.CreateFlavorRequest
	if req.Flavors != nil {
		flavors = *req.Flavors
	}
	
	createdSession, err := h.repo.Create(c.Request().Context(), session, flavors)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create session"})
	}

	return c.JSON(http.StatusCreated, createdSession)
}

func (h *SessionHandler) GetSession(c echo.Context) error {
	sessionID := c.Param("id")
	userID := c.Get("user_id").(string)

	session, err := h.repo.GetByID(c.Request().Context(), sessionID)
	if err != nil {
		if err.Error() == "session not found" {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Session not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get session"})
	}

	// Check if user has access to this session
	if session.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied"})
	}

	return c.JSON(http.StatusOK, session)
}

func (h *SessionHandler) GetUserSessions(c echo.Context) error {
	userID := c.Get("user_id").(string)

	// Parse query parameters
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	if limit == 0 {
		limit = 20
	}

	sessions, err := h.repo.GetByUserID(c.Request().Context(), userID, limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get sessions"})
	}

	// Get total count
	total, err := h.repo.GetTotalCount(c.Request().Context(), userID)
	if err != nil {
		total = len(sessions) // Fallback to current page size
	}

	response := map[string]interface{}{
		"sessions": sessions,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	}

	return c.JSON(http.StatusOK, response)
}

func (h *SessionHandler) UpdateSession(c echo.Context) error {
	sessionID := c.Param("id")
	userID := c.Get("user_id").(string)

	// Check ownership
	session, err := h.repo.GetByID(c.Request().Context(), sessionID)
	if err != nil {
		if err.Error() == "session not found" {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Session not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get session"})
	}

	if session.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied"})
	}

	var req models.UpdateSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Debug log
	c.Logger().Infof("UpdateSession request for ID %s: %+v", sessionID, req)

	if err := h.repo.Update(c.Request().Context(), sessionID, &req); err != nil {
		c.Logger().Errorf("Failed to update session %s: %v", sessionID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update session"})
	}

	// Fetch the updated session to return it
	updatedSession, err := h.repo.GetByID(c.Request().Context(), sessionID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get updated session"})
	}

	return c.JSON(http.StatusOK, updatedSession)
}

func (h *SessionHandler) DeleteSession(c echo.Context) error {
	sessionID := c.Param("id")
	userID := c.Get("user_id").(string)

	// Check ownership
	session, err := h.repo.GetByID(c.Request().Context(), sessionID)
	if err != nil {
		if err.Error() == "session not found" {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Session not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get session"})
	}

	if session.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Access denied"})
	}

	if err := h.repo.Delete(c.Request().Context(), sessionID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete session"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Session deleted successfully"})
}
