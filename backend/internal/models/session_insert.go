package models

import "time"

// SessionInsert is used for inserting sessions without timestamps
type SessionInsert struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	CreatedBy    string    `json:"created_by"`
	SessionDate  time.Time `json:"session_date"`
	StoreName    *string   `json:"store_name,omitempty"`
	Notes        *string   `json:"notes,omitempty"`
	OrderDetails *string   `json:"order_details,omitempty"`
	MixName      *string   `json:"mix_name,omitempty"`
	Creator      *string   `json:"creator,omitempty"`
	// Explicitly exclude created_at and updated_at
}

// FlavorInsert is used for inserting flavors without timestamps
type FlavorInsert struct {
	ID          string  `json:"id"`
	SessionID   string  `json:"session_id"`
	FlavorName  *string `json:"flavor_name,omitempty"`
	Brand       *string `json:"brand,omitempty"`
	FlavorOrder int     `json:"flavor_order"`
	// Explicitly exclude created_at
}
