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

	// Ensure user can only create sessions for themselves
	if req.UserID != userID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Cannot create sessions for other users"})
	}

	session := &models.ShishaSession{
		UserID:       req.UserID,
		CreatedBy:    userID,
		SessionDate:  req.SessionDate,
		StoreName:    req.StoreName,
		Notes:        req.Notes,
		OrderDetails: req.OrderDetails,
		MixName:      req.MixName,
	}

	createdSession, err := h.repo.Create(c.Request().Context(), session, req.Flavors)
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

	return c.JSON(http.StatusOK, sessions)
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

	if err := h.repo.Update(c.Request().Context(), sessionID, &req); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update session"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Session updated successfully"})
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
