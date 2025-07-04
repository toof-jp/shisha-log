package repository

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"sort"
	"time"

	"github.com/google/uuid"
	postgrest "github.com/supabase-community/postgrest-go"
	"github.com/supabase-community/supabase-go"
	"github.com/toof-jp/shisha-log/backend/internal/models"
)

type SessionRepository struct {
	client *supabase.Client
}

func NewSessionRepository(client *supabase.Client) *SessionRepository {
	return &SessionRepository{client: client}
}

func (r *SessionRepository) Create(ctx context.Context, session *models.ShishaSession, flavors []models.CreateFlavorRequest) (*models.SessionWithFlavors, error) {
	// Start transaction by creating session first
	sessionID := uuid.New().String()
	session.ID = sessionID

	// Create insert struct without timestamps
	insertSession := models.SessionInsert{
		ID:           sessionID,
		UserID:       session.UserID,
		CreatedBy:    session.CreatedBy,
		SessionDate:  session.SessionDate,
		StoreName:    session.StoreName,
		Notes:        session.Notes,
		OrderDetails: session.OrderDetails,
		MixName:      session.MixName,
		Creator:      session.Creator,
		Amount:       session.Amount,
	}

	data, _, err := r.client.From("shisha_sessions").
		Insert(insertSession, false, "", "", "").
		Execute()

	if err != nil {
		return nil, err
	}

	var createdSessions []models.ShishaSession
	err = json.Unmarshal(data, &createdSessions)
	if err != nil {
		return nil, err
	}

	if len(createdSessions) == 0 {
		return nil, errors.New("failed to create session")
	}

	createdSession := createdSessions[0]

	// Create flavors
	var flavorInserts []models.FlavorInsert
	for i, flavor := range flavors {
		flavorInsert := models.FlavorInsert{
			ID:          uuid.New().String(),
			SessionID:   createdSession.ID,
			FlavorName:  flavor.FlavorName,
			Brand:       flavor.Brand,
			FlavorOrder: i + 1, // Order starts from 1
		}
		flavorInserts = append(flavorInserts, flavorInsert)
	}

	if len(flavorInserts) > 0 {
		_, _, err = r.client.From("session_flavors").
			Insert(flavorInserts, false, "", "", "").
			Execute()

		if err != nil {
			// Ideally should rollback session creation, but Supabase doesn't support transactions via REST API
			return nil, err
		}
	}

	// Fetch the session again to get proper timestamps
	// This is a workaround for Supabase Go client timestamp issue
	freshSession, err := r.GetByID(ctx, createdSession.ID)
	if err != nil {
		return nil, err
	}

	return freshSession, nil
}

func (r *SessionRepository) GetByID(ctx context.Context, id string) (*models.SessionWithFlavors, error) {
	var sessions []models.ShishaSession

	data, _, err := r.client.From("shisha_sessions").
		Select("id,user_id,created_by,session_date,store_name,notes,order_details,mix_name,creator,amount,created_at,updated_at", "exact", false).
		Eq("id", id).
		Execute()

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &sessions)
	if err != nil {
		return nil, err
	}

	if len(sessions) == 0 {
		return nil, errors.New("session not found")
	}

	session := sessions[0]

	// Get flavors
	var flavors []models.SessionFlavor
	data, _, err = r.client.From("session_flavors").
		Select("id,session_id,flavor_name,brand,flavor_order,created_at", "exact", false).
		Eq("session_id", id).
		Order("flavor_order", nil).
		Execute()

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &flavors)
	if err != nil {
		return nil, err
	}

	return &models.SessionWithFlavors{
		ShishaSession: session,
		Flavors:       flavors,
	}, nil
}

func (r *SessionRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]models.SessionWithFlavors, error) {
	var sessions []models.ShishaSession

	query := r.client.From("shisha_sessions").
		Select("id,user_id,created_by,session_date,store_name,notes,order_details,mix_name,creator,amount,created_at,updated_at", "exact", false).
		Eq("user_id", userID).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}) // Order by created_at descending

	if limit > 0 {
		query = query.Limit(limit, "")
		if offset > 0 {
			query = query.Range(offset, offset+limit-1, "")
		}
	}

	data, _, err := query.Execute()
	if err != nil {
		log.Printf("Error executing session query: %v", err)
		return nil, err
	}

	err = json.Unmarshal(data, &sessions)
	if err != nil {
		return nil, err
	}

	// Get flavors for all sessions
	sessionIDs := make([]string, len(sessions))
	for i, session := range sessions {
		sessionIDs[i] = session.ID
	}

	var allFlavors []models.SessionFlavor
	if len(sessionIDs) > 0 {
		data, _, err := r.client.From("session_flavors").
			Select("id,session_id,flavor_name,brand,flavor_order,created_at", "exact", false).
			In("session_id", sessionIDs).
			Order("flavor_order", nil).
			Execute()

		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(data, &allFlavors)
		if err != nil {
			return nil, err
		}
	}

	// Map flavors to sessions
	flavorMap := make(map[string][]models.SessionFlavor)
	for _, flavor := range allFlavors {
		flavorMap[flavor.SessionID] = append(flavorMap[flavor.SessionID], flavor)
	}

	result := make([]models.SessionWithFlavors, len(sessions))
	for i, session := range sessions {
		result[i] = models.SessionWithFlavors{
			ShishaSession: session,
			Flavors:       flavorMap[session.ID],
		}
	}

	return result, nil
}

func (r *SessionRepository) Update(ctx context.Context, id string, update *models.UpdateSessionRequest) error {
	updateMap := make(map[string]interface{})

	if update.SessionDate != nil {
		updateMap["session_date"] = *update.SessionDate
	}
	if update.StoreName != nil {
		if *update.StoreName == "" {
			updateMap["store_name"] = nil
		} else {
			updateMap["store_name"] = *update.StoreName
		}
	}
	if update.Notes != nil {
		if *update.Notes == "" {
			updateMap["notes"] = nil
		} else {
			updateMap["notes"] = *update.Notes
		}
	}
	if update.OrderDetails != nil {
		if *update.OrderDetails == "" {
			updateMap["order_details"] = nil
		} else {
			updateMap["order_details"] = *update.OrderDetails
		}
	}
	if update.MixName != nil {
		if *update.MixName == "" {
			updateMap["mix_name"] = nil
		} else {
			updateMap["mix_name"] = *update.MixName
		}
	}
	if update.Creator != nil {
		if *update.Creator == "" {
			updateMap["creator"] = nil
		} else {
			updateMap["creator"] = *update.Creator
		}
	}
	if update.Amount != nil {
		updateMap["amount"] = *update.Amount
	}

	// Debug log
	// fmt.Printf("Updating session %s with data: %+v\n", id, updateMap)

	// Update session fields if any
	if len(updateMap) > 0 {
		_, _, err := r.client.From("shisha_sessions").
			Update(updateMap, "", "").
			Eq("id", id).
			Execute()

		if err != nil {
			return err
		}
	}

	// Update flavors if provided
	if update.Flavors != nil {
		// Delete existing flavors
		_, _, err := r.client.From("session_flavors").
			Delete("", "").
			Eq("session_id", id).
			Execute()

		if err != nil {
			return err
		}

		// Insert new flavors
		var flavorInserts []models.FlavorInsert
		for i, flavor := range *update.Flavors {
			flavorInsert := models.FlavorInsert{
				ID:          uuid.New().String(),
				SessionID:   id,
				FlavorName:  flavor.FlavorName,
				Brand:       flavor.Brand,
				FlavorOrder: i + 1, // Order starts from 1
			}
			flavorInserts = append(flavorInserts, flavorInsert)
		}

		if len(flavorInserts) > 0 {
			_, _, err = r.client.From("session_flavors").
				Insert(flavorInserts, false, "", "", "").
				Execute()

			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *SessionRepository) GetTotalCount(ctx context.Context, userID string) (int, error) {
	// Supabase doesn't provide a direct count method via REST API
	// So we'll fetch all sessions without limit and count them
	data, _, err := r.client.From("shisha_sessions").
		Select("id", "exact", false).
		Eq("user_id", userID).
		Execute()

	if err != nil {
		return 0, err
	}

	var sessions []map[string]interface{}
	err = json.Unmarshal(data, &sessions)
	if err != nil {
		return 0, err
	}

	return len(sessions), nil
}

func (r *SessionRepository) Delete(ctx context.Context, id string) error {
	// Delete flavors first
	_, _, err := r.client.From("session_flavors").
		Delete("", "").
		Eq("session_id", id).
		Execute()

	if err != nil {
		return err
	}

	// Delete session
	_, _, err = r.client.From("shisha_sessions").
		Delete("", "").
		Eq("id", id).
		Execute()

	return err
}

func (r *SessionRepository) GetFlavorStats(ctx context.Context, userID string) (*models.FlavorStats, error) {
	// Get all sessions for the user - use a large limit instead of 0
	sessions, err := r.GetByUserID(ctx, userID, 10000, 0) // Get all sessions up to 10000
	if err != nil {
		return nil, err
	}

	// Count main flavors (flavor_order = 1) and all flavors
	mainFlavorMap := make(map[string]int)
	allFlavorMap := make(map[string]int)

	for _, session := range sessions {
		for _, flavor := range session.Flavors {
			if flavor.FlavorName != nil && *flavor.FlavorName != "" {
				// Count all flavors
				allFlavorMap[*flavor.FlavorName]++

				// Count only main flavors (flavor_order = 1)
				if flavor.FlavorOrder == 1 {
					mainFlavorMap[*flavor.FlavorName]++
				}
			}
		}
	}

	// Convert maps to sorted slices
	mainFlavors := make([]models.FlavorCount, 0, len(mainFlavorMap))
	for name, count := range mainFlavorMap {
		mainFlavors = append(mainFlavors, models.FlavorCount{
			FlavorName: name,
			Count:      count,
		})
	}

	allFlavors := make([]models.FlavorCount, 0, len(allFlavorMap))
	for name, count := range allFlavorMap {
		allFlavors = append(allFlavors, models.FlavorCount{
			FlavorName: name,
			Count:      count,
		})
	}

	// Sort by count descending
	sort.Slice(mainFlavors, func(i, j int) bool {
		return mainFlavors[i].Count > mainFlavors[j].Count
	})

	sort.Slice(allFlavors, func(i, j int) bool {
		return allFlavors[i].Count > allFlavors[j].Count
	})

	// No limit - return all flavors

	return &models.FlavorStats{
		MainFlavors: mainFlavors,
		AllFlavors:  allFlavors,
	}, nil
}

func (r *SessionRepository) GetCalendarData(ctx context.Context, userID string, year int, month int) ([]models.CalendarData, error) {
	// Calculate start and end dates for the month
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	// Format dates for query
	startStr := startDate.Format("2006-01-02")
	endStr := endDate.Format("2006-01-02")

	// Fetch sessions for the month
	data, _, err := r.client.From("shisha_sessions").
		Select("id,session_date", "", false).
		Eq("user_id", userID).
		Gte("session_date", startStr).
		Lte("session_date", endStr).
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

	// Count sessions by date
	dateCount := make(map[string]int)
	for _, session := range sessions {
		// Extract date part only (YYYY-MM-DD)
		date := session.SessionDate[:10]
		dateCount[date]++
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

func (r *SessionRepository) GetByDate(ctx context.Context, userID string, date string) ([]models.SessionWithFlavors, error) {
	// Parse the date to ensure it's valid
	dateOnly, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, err
	}

	// Set time range for the entire day in UTC
	startTime := dateOnly.UTC()
	endTime := startTime.AddDate(0, 0, 1)

	// Query sessions for the specific date
	data, _, err := r.client.From("shisha_sessions").
		Select("*", "exact", false).
		Eq("user_id", userID).
		Gte("session_date", startTime.Format(time.RFC3339)).
		Lt("session_date", endTime.Format(time.RFC3339)).
		Order("session_date", nil). // nil uses default options (descending)
		Execute()

	if err != nil {
		return nil, err
	}

	var sessions []models.ShishaSession
	if err := json.Unmarshal(data, &sessions); err != nil {
		return nil, err
	}

	// Fetch flavors for each session
	var sessionsWithFlavors []models.SessionWithFlavors
	for _, session := range sessions {
		sessionWithFlavors := models.SessionWithFlavors{ShishaSession: session}

		// Fetch flavors
		flavorData, _, err := r.client.From("session_flavors").
			Select("*", "exact", false).
			Eq("session_id", session.ID).
			Order("flavor_order", nil). // Order by flavor_order ascending (default)
			Execute()

		if err == nil {
			var flavors []models.SessionFlavor
			if err := json.Unmarshal(flavorData, &flavors); err == nil {
				sessionWithFlavors.Flavors = flavors
			}
		}

		sessionsWithFlavors = append(sessionsWithFlavors, sessionWithFlavors)
	}

	return sessionsWithFlavors, nil
}

func (r *SessionRepository) GetByDateRange(ctx context.Context, userID string, startTime string, endTime string) ([]models.SessionWithFlavors, error) {

	// Parse start and end times for filtering
	startTimeParsed, err := time.Parse(time.RFC3339, startTime)
	if err != nil {
		return nil, err
	}
	endTimeParsed, err := time.Parse(time.RFC3339, endTime)
	if err != nil {
		return nil, err
	}

	// Query sessions with a wider range to account for potential Supabase timezone issues
	// We'll filter manually afterwards
	bufferStart := startTimeParsed.Add(-24 * time.Hour)
	bufferEnd := endTimeParsed.Add(24 * time.Hour)

	data, _, err := r.client.From("shisha_sessions").
		Select("*", "exact", false).
		Eq("user_id", userID).
		Gte("session_date", bufferStart.Format(time.RFC3339)).
		Lt("session_date", bufferEnd.Format(time.RFC3339)).
		Order("session_date", nil). // nil uses default options (descending)
		Execute()

	if err != nil {
		return nil, err
	}

	var sessions []models.ShishaSession
	if err := json.Unmarshal(data, &sessions); err != nil {
		return nil, err
	}

	// Manual filtering to ensure we only get sessions within the exact time range
	var filteredSessions []models.ShishaSession
	for _, session := range sessions {
		// SessionDate is already a time.Time after JSON unmarshaling
		sessionTime := session.SessionDate

		// Check if session falls within the requested range
		if sessionTime.Equal(startTimeParsed) || (sessionTime.After(startTimeParsed) && sessionTime.Before(endTimeParsed)) {
			filteredSessions = append(filteredSessions, session)
		}
	}

	// Fetch flavors for each session
	var sessionsWithFlavors []models.SessionWithFlavors
	for _, session := range filteredSessions {
		sessionWithFlavors := models.SessionWithFlavors{ShishaSession: session}

		// Fetch flavors
		flavorData, _, err := r.client.From("session_flavors").
			Select("*", "exact", false).
			Eq("session_id", session.ID).
			Order("flavor_order", nil). // Order by flavor_order ascending (default)
			Execute()

		if err == nil {
			var flavors []models.SessionFlavor
			if err := json.Unmarshal(flavorData, &flavors); err == nil {
				sessionWithFlavors.Flavors = flavors
			}
		}

		sessionsWithFlavors = append(sessionsWithFlavors, sessionWithFlavors)
	}

	return sessionsWithFlavors, nil
}

func (r *SessionRepository) GetStoreStats(ctx context.Context, userID string) (*models.StoreStats, error) {
	// Get all sessions for the user
	sessions, err := r.GetByUserID(ctx, userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	// Count sessions by store (excluding empty store names)
	storeMap := make(map[string]int)
	for _, session := range sessions {
		if session.StoreName != nil && *session.StoreName != "" {
			storeMap[*session.StoreName]++
		}
	}

	// Convert to sorted slice
	stores := make([]models.StoreCount, 0, len(storeMap))
	for name, count := range storeMap {
		stores = append(stores, models.StoreCount{
			StoreName: name,
			Count:     count,
		})
	}

	// Sort by count descending
	sort.Slice(stores, func(i, j int) bool {
		return stores[i].Count > stores[j].Count
	})

	// No limit - return all stores

	return &models.StoreStats{
		Stores: stores,
	}, nil
}

func (r *SessionRepository) GetCreatorStats(ctx context.Context, userID string) (*models.CreatorStats, error) {
	// Get all sessions for the user
	sessions, err := r.GetByUserID(ctx, userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	// Count sessions by creator (excluding empty creator names)
	creatorMap := make(map[string]int)
	for _, session := range sessions {
		if session.Creator != nil && *session.Creator != "" {
			creatorMap[*session.Creator]++
		}
	}

	// Convert to sorted slice
	creators := make([]models.CreatorCount, 0, len(creatorMap))
	for name, count := range creatorMap {
		creators = append(creators, models.CreatorCount{
			Creator: name,
			Count:   count,
		})
	}

	// Sort by count descending
	sort.Slice(creators, func(i, j int) bool {
		return creators[i].Count > creators[j].Count
	})

	// No limit - return all creators

	return &models.CreatorStats{
		Creators: creators,
	}, nil
}

func (r *SessionRepository) GetOrderStats(ctx context.Context, userID string) (*models.OrderStats, error) {
	// Get all sessions for the user
	sessions, err := r.GetByUserID(ctx, userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	// Count sessions by order (excluding empty order details)
	orderMap := make(map[string]int)
	for _, session := range sessions {
		if session.OrderDetails != nil && *session.OrderDetails != "" {
			orderMap[*session.OrderDetails]++
		}
	}

	// Convert to sorted slice
	orders := make([]models.OrderCount, 0, len(orderMap))
	for name, count := range orderMap {
		orders = append(orders, models.OrderCount{
			OrderDetails: name,
			Count:        count,
		})
	}

	// Sort by count descending
	sort.Slice(orders, func(i, j int) bool {
		return orders[i].Count > orders[j].Count
	})

	// No limit - return all orders

	return &models.OrderStats{
		Orders: orders,
	}, nil
}
