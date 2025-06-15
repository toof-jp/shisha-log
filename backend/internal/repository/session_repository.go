package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
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
	var createdSessions []models.ShishaSession
	session.ID = uuid.New().String()

	data, _, err := r.client.From("shisha_sessions").
		Insert(session, false, "", "", "").
		Execute()

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &createdSessions)
	if err != nil {
		return nil, err
	}

	if len(createdSessions) == 0 {
		return nil, errors.New("failed to create session")
	}

	createdSession := createdSessions[0]

	// Create flavors
	var sessionFlavors []models.SessionFlavor
	for _, flavor := range flavors {
		sessionFlavor := models.SessionFlavor{
			ID:         uuid.New().String(),
			SessionID:  createdSession.ID,
			FlavorName: flavor.FlavorName,
			Brand:      flavor.Brand,
		}
		sessionFlavors = append(sessionFlavors, sessionFlavor)
	}

	if len(sessionFlavors) > 0 {
		_, _, err = r.client.From("session_flavors").
			Insert(sessionFlavors, false, "", "", "").
			Execute()

		if err != nil {
			// Ideally should rollback session creation, but Supabase doesn't support transactions via REST API
			return nil, err
		}
	}

	return &models.SessionWithFlavors{
		ShishaSession: createdSession,
		Flavors:       sessionFlavors,
	}, nil
}

func (r *SessionRepository) GetByID(ctx context.Context, id string) (*models.SessionWithFlavors, error) {
	var sessions []models.ShishaSession

	data, _, err := r.client.From("shisha_sessions").
		Select("*", "exact", false).
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
		Select("*", "exact", false).
		Eq("session_id", id).
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
		Select("*", "exact", false).
		Eq("user_id", userID).
		Order("session_date", nil) // nil uses default options (descending)

	if limit > 0 {
		query = query.Limit(limit, "")
	}

	if offset > 0 {
		query = query.Range(offset, offset+limit-1, "")
	}

	data, _, err := query.Execute()
	if err != nil {
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
			Select("*", "exact", false).
			In("session_id", sessionIDs).
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
		updateMap["store_name"] = *update.StoreName
	}
	if update.Notes != nil {
		updateMap["notes"] = *update.Notes
	}
	if update.OrderDetails != nil {
		updateMap["order_details"] = *update.OrderDetails
	}
	if update.MixName != nil {
		updateMap["mix_name"] = *update.MixName
	}

	if len(updateMap) == 0 {
		return nil
	}

	_, _, err := r.client.From("shisha_sessions").
		Update(updateMap, "", "").
		Eq("id", id).
		Execute()

	return err
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
