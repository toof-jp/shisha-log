package models

import (
	"time"
)

type Profile struct {
	ID          string    `json:"id"` // This will be UUID as string
	DisplayName string    `json:"display_name"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
