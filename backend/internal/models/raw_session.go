package models

import (
	"time"
)

// RawSession is used for parsing JSON from Supabase
type RawSession struct {
	ID           string  `json:"id"`
	UserID       string  `json:"user_id"`
	CreatedBy    string  `json:"created_by"`
	SessionDate  string  `json:"session_date"`
	StoreName    *string `json:"store_name"`
	Notes        *string `json:"notes"`
	OrderDetails *string `json:"order_details"`
	MixName      *string `json:"mix_name"`
	Creator      *string `json:"creator"`
	CreatedAt    string  `json:"created_at"`
	UpdatedAt    string  `json:"updated_at"`
}

// ToShishaSession converts RawSession to ShishaSession
func (rs *RawSession) ToShishaSession() (*ShishaSession, error) {
	sessionDate, err := time.Parse(time.RFC3339, rs.SessionDate)
	if err != nil {
		return nil, err
	}

	// Parse created_at with fallback to zero time if parsing fails
	createdAt := time.Time{}
	if rs.CreatedAt != "" && rs.CreatedAt != "0001-01-01T00:00:00Z" {
		if parsed, err := time.Parse(time.RFC3339, rs.CreatedAt); err == nil {
			createdAt = parsed
		}
	}

	// Parse updated_at with fallback to zero time if parsing fails
	updatedAt := time.Time{}
	if rs.UpdatedAt != "" && rs.UpdatedAt != "0001-01-01T00:00:00Z" {
		if parsed, err := time.Parse(time.RFC3339, rs.UpdatedAt); err == nil {
			updatedAt = parsed
		}
	}

	return &ShishaSession{
		ID:           rs.ID,
		UserID:       rs.UserID,
		CreatedBy:    rs.CreatedBy,
		SessionDate:  sessionDate,
		StoreName:    rs.StoreName,
		Notes:        rs.Notes,
		OrderDetails: rs.OrderDetails,
		MixName:      rs.MixName,
		Creator:      rs.Creator,
		CreatedAt:    createdAt,
		UpdatedAt:    updatedAt,
	}, nil
}

// RawSessionFlavor is used for parsing JSON from Supabase
type RawSessionFlavor struct {
	ID         string  `json:"id"`
	SessionID  string  `json:"session_id"`
	FlavorName *string `json:"flavor_name"`
	Brand      *string `json:"brand"`
	CreatedAt  string  `json:"created_at"`
}

// ToSessionFlavor converts RawSessionFlavor to SessionFlavor
func (rf *RawSessionFlavor) ToSessionFlavor() *SessionFlavor {
	// Parse created_at with fallback to zero time if parsing fails
	createdAt := time.Time{}
	if rf.CreatedAt != "" && rf.CreatedAt != "0001-01-01T00:00:00Z" {
		if parsed, err := time.Parse(time.RFC3339, rf.CreatedAt); err == nil {
			createdAt = parsed
		}
	}

	return &SessionFlavor{
		ID:         rf.ID,
		SessionID:  rf.SessionID,
		FlavorName: rf.FlavorName,
		Brand:      rf.Brand,
		CreatedAt:  createdAt,
	}
}
