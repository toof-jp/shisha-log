package repository

import (
	"context"
	"encoding/json"
	"sort"
	"time"

	"github.com/toof-jp/shisha-log/backend/internal/models"
)

func (r *SessionRepository) GetCalendarDataWithTimezone(ctx context.Context, userID string, year int, month int, timezone string) ([]models.CalendarData, error) {
	// Load the timezone
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		// Fallback to UTC if timezone is invalid
		loc = time.UTC
	}

	// Calculate start and end dates for the month in the specified timezone
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
	endDate := startDate.AddDate(0, 1, 0)

	// Convert to UTC for database query
	startUTC := startDate.UTC()
	endUTC := endDate.UTC()

	// Fetch sessions for the month (including some buffer for timezone differences)
	// We fetch a bit earlier and later to account for timezone offsets
	bufferStart := startUTC.Add(-24 * time.Hour)
	bufferEnd := endUTC.Add(24 * time.Hour)

	data, _, err := r.client.From("shisha_sessions").
		Select("id,session_date", "", false).
		Eq("user_id", userID).
		Gte("session_date", bufferStart.Format(time.RFC3339)).
		Lt("session_date", bufferEnd.Format(time.RFC3339)).
		Execute()

	if err != nil {
		return nil, err
	}

	var sessions []struct {
		ID          string `json:"id"`
		SessionDate string `json:"session_date"`
	}

	if err := json.Unmarshal(data, &sessions); err != nil {
		return nil, err
	}

	// Count sessions by date in the user's timezone
	dateCount := make(map[string]int)

	for _, session := range sessions {
		// Parse the session date
		sessionTime, err := time.Parse(time.RFC3339, session.SessionDate)
		if err != nil {
			continue
		}

		// Convert to user's timezone
		localTime := sessionTime.In(loc)

		// Check if this session falls within the requested month
		if localTime.Year() == year && int(localTime.Month()) == month {
			// Format date as YYYY-MM-DD in user's timezone
			dateStr := localTime.Format("2006-01-02")
			dateCount[dateStr]++
		}
	}

	// Convert to CalendarData slice
	var calendarData []models.CalendarData
	for date, count := range dateCount {
		calendarData = append(calendarData, models.CalendarData{
			Date:  date,
			Count: count,
		})
	}

	// Sort by date
	sort.Slice(calendarData, func(i, j int) bool {
		return calendarData[i].Date < calendarData[j].Date
	})

	// If no data, return empty slice instead of nil
	if calendarData == nil {
		calendarData = []models.CalendarData{}
	}

	return calendarData, nil
}
