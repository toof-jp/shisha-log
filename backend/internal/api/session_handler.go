package api

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

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

// CreateSession godoc
// @Summary Create a new session
// @Description Create a new shisha session for the authenticated user
// @Tags sessions
// @Accept json
// @Produce json
// @Security Bearer
// @Param session body models.CreateSessionRequest true "Session data"
// @Success 201 {object} models.SessionWithFlavors "Created session with flavors"
// @Failure 400 {object} object{error=string} "Invalid request body"
// @Failure 500 {object} object{error=string} "Failed to create session"
// @Router /sessions [post]
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
		Amount:       req.Amount,
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

// GetSession godoc
// @Summary Get a session by ID
// @Description Get a specific session by its ID
// @Tags sessions
// @Produce json
// @Security Bearer
// @Param id path string true "Session ID"
// @Success 200 {object} models.SessionWithFlavors "Session details with flavors"
// @Failure 403 {object} object{error=string} "Access denied"
// @Failure 404 {object} object{error=string} "Session not found"
// @Failure 500 {object} object{error=string} "Internal server error"
// @Router /sessions/{id} [get]
func (h *SessionHandler) GetSession(c echo.Context) error {
	sessionID := c.Param("id")
	userID := c.Get("user_id").(string)

	// Special handling for calendar route (workaround for Echo routing issue)
	if sessionID == "calendar" {
		return h.GetCalendarData(c)
	}

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

// GetUserSessions godoc
// @Summary Get user's sessions
// @Description Get paginated list of sessions for the authenticated user
// @Tags sessions
// @Produce json
// @Security Bearer
// @Param limit query int false "Number of items per page" default(20)
// @Param offset query int false "Number of items to skip" default(0)
// @Success 200 {object} object{sessions=[]models.SessionWithFlavors,total=int,limit=int,offset=int} "Paginated sessions list"
// @Failure 500 {object} object{error=string} "Failed to get sessions"
// @Router /sessions [get]
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
		log.Printf("GetUserSessions error for user %s: %v", userID, err)
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

// UpdateSession godoc
// @Summary Update a session
// @Description Update an existing session
// @Tags sessions
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path string true "Session ID"
// @Param session body models.UpdateSessionRequest true "Updated session data"
// @Success 200 {object} models.SessionWithFlavors "Updated session"
// @Failure 400 {object} object{error=string} "Invalid request body"
// @Failure 403 {object} object{error=string} "Access denied"
// @Failure 404 {object} object{error=string} "Session not found"
// @Failure 500 {object} object{error=string} "Failed to update session"
// @Router /sessions/{id} [put]
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

// DeleteSession godoc
// @Summary Delete a session
// @Description Delete a session by ID
// @Tags sessions
// @Produce json
// @Security Bearer
// @Param id path string true "Session ID"
// @Success 200 {object} object{message=string} "Session deleted successfully"
// @Failure 403 {object} object{error=string} "Access denied"
// @Failure 404 {object} object{error=string} "Session not found"
// @Failure 500 {object} object{error=string} "Failed to delete session"
// @Router /sessions/{id} [delete]
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

// GetFlavorStats godoc
// @Summary Get flavor statistics
// @Description Get flavor usage statistics for the authenticated user
// @Tags statistics
// @Produce json
// @Security Bearer
// @Success 200 {object} models.FlavorStats "Flavor statistics"
// @Failure 500 {object} object{error=string} "Failed to get flavor statistics"
// @Router /flavors/stats [get]
func (h *SessionHandler) GetFlavorStats(c echo.Context) error {
	userID := c.Get("user_id").(string)

	stats, err := h.repo.GetFlavorStats(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetFlavorStats error for user %s: %v", userID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get flavor statistics"})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetCalendarData godoc
// @Summary Get calendar data
// @Description Get session counts for each day in a specific month
// @Tags sessions
// @Produce json
// @Security Bearer
// @Param year query int true "Year"
// @Param month query int true "Month (1-12)"
// @Param timezone query string false "Timezone (default UTC)"
// @Success 200 {object} map[string]int "Map of date strings to session counts"
// @Failure 400 {object} object{error=string} "Invalid parameters"
// @Failure 500 {object} object{error=string} "Failed to get calendar data"
// @Router /sessions/calendar [get]
func (h *SessionHandler) GetCalendarData(c echo.Context) error {
	userID := c.Get("user_id").(string)

	// Get year, month, and timezone from query parameters
	yearStr := c.QueryParam("year")
	monthStr := c.QueryParam("month")
	timezone := c.QueryParam("timezone")

	// Default to UTC if no timezone provided
	if timezone == "" {
		timezone = "UTC"
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid year parameter"})
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil || month < 1 || month > 12 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid month parameter"})
	}

	calendarData, err := h.repo.GetCalendarDataWithTimezone(c.Request().Context(), userID, year, month, timezone)
	if err != nil {
		log.Printf("GetCalendarData error for user %s: %v", userID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get calendar data"})
	}

	return c.JSON(http.StatusOK, calendarData)
}

// GetSessionsByDate godoc
// @Summary Get sessions by date
// @Description Get all sessions for a specific date
// @Tags sessions
// @Produce json
// @Security Bearer
// @Param date query string true "Date in YYYY-MM-DD format"
// @Param timezone query string false "Timezone (default UTC)"
// @Success 200 {object} object{sessions=[]models.SessionWithFlavors,date=string} "Sessions for the specified date"
// @Failure 400 {object} object{error=string} "Invalid date format"
// @Failure 500 {object} object{error=string} "Failed to get sessions"
// @Router /sessions/by-date [get]
func (h *SessionHandler) GetSessionsByDate(c echo.Context) error {
	userID := c.Get("user_id").(string)
	dateStr := c.QueryParam("date")
	timezone := c.QueryParam("timezone")

	if dateStr == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Date parameter is required"})
	}

	// Default to UTC if no timezone provided
	if timezone == "" {
		timezone = "UTC"
	}

	// Load the timezone
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		// Fallback to UTC if timezone is invalid
		loc = time.UTC
	}

	// Parse the date components
	var year, month, day int
	_, err = fmt.Sscanf(dateStr, "%d-%d-%d", &year, &month, &day)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid date format. Use YYYY-MM-DD"})
	}

	// Create start and end times in the user's timezone
	startLocal := time.Date(year, time.Month(month), day, 0, 0, 0, 0, loc)
	endLocal := time.Date(year, time.Month(month), day, 23, 59, 59, 999999999, loc)

	// Convert to UTC for database query
	startUTC := startLocal.UTC()
	endUTC := endLocal.UTC()

	// Get sessions in the UTC range
	sessions, err := h.repo.GetByDateRange(c.Request().Context(), userID, startUTC.Format(time.RFC3339), endUTC.Format(time.RFC3339))
	if err != nil {
		log.Printf("GetSessionsByDate error for user %s, date %s: %v", userID, dateStr, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get sessions"})
	}

	response := map[string]interface{}{
		"sessions": sessions,
		"date":     dateStr,
	}

	return c.JSON(http.StatusOK, response)
}

// GetStoreStats godoc
// @Summary Get store statistics
// @Description Get store visit statistics for the authenticated user
// @Tags statistics
// @Produce json
// @Security Bearer
// @Success 200 {object} models.StoreStats "Store statistics"
// @Failure 500 {object} object{error=string} "Failed to get store statistics"
// @Router /stores/stats [get]
func (h *SessionHandler) GetStoreStats(c echo.Context) error {
	userID := c.Get("user_id").(string)

	stats, err := h.repo.GetStoreStats(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetStoreStats error for user %s: %v", userID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get store statistics"})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetCreatorStats godoc
// @Summary Get creator statistics
// @Description Get creator statistics for the authenticated user
// @Tags statistics
// @Produce json
// @Security Bearer
// @Success 200 {object} models.CreatorStats "Creator statistics"
// @Failure 500 {object} object{error=string} "Failed to get creator statistics"
// @Router /creators/stats [get]
func (h *SessionHandler) GetCreatorStats(c echo.Context) error {
	userID := c.Get("user_id").(string)

	stats, err := h.repo.GetCreatorStats(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetCreatorStats error for user %s: %v", userID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get creator statistics"})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetOrderStats godoc
// @Summary Get order statistics
// @Description Get order statistics for the authenticated user
// @Tags statistics
// @Produce json
// @Security Bearer
// @Success 200 {object} models.OrderStats "Order statistics"
// @Failure 500 {object} object{error=string} "Failed to get order statistics"
// @Router /orders/stats [get]
func (h *SessionHandler) GetOrderStats(c echo.Context) error {
	userID := c.Get("user_id").(string)

	stats, err := h.repo.GetOrderStats(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetOrderStats error for user %s: %v", userID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to get order statistics"})
	}

	return c.JSON(http.StatusOK, stats)
}
