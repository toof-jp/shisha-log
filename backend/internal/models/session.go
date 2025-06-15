package models

import (
	"time"
)

type ShishaSession struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	CreatedBy    string    `json:"created_by"`
	SessionDate  time.Time `json:"session_date"`
	StoreName    string    `json:"store_name"`
	Notes        *string   `json:"notes"`
	OrderDetails *string   `json:"order_details"`
	MixName      *string   `json:"mix_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type SessionFlavor struct {
	ID         string    `json:"id"`
	SessionID  string    `json:"session_id"`
	FlavorName string    `json:"flavor_name"`
	Brand      *string   `json:"brand"`
	CreatedAt  time.Time `json:"created_at"`
}

type SessionWithFlavors struct {
	ShishaSession
	Flavors []SessionFlavor `json:"flavors"`
}

type CreateSessionRequest struct {
	UserID       string                `json:"user_id" validate:"required"`
	SessionDate  time.Time             `json:"session_date" validate:"required"`
	StoreName    string                `json:"store_name" validate:"required"`
	Notes        *string               `json:"notes"`
	OrderDetails *string               `json:"order_details"`
	MixName      *string               `json:"mix_name"`
	Flavors      []CreateFlavorRequest `json:"flavors"`
}

type CreateFlavorRequest struct {
	FlavorName string  `json:"flavor_name" validate:"required"`
	Brand      *string `json:"brand"`
}

type UpdateSessionRequest struct {
	SessionDate  *time.Time `json:"session_date"`
	StoreName    *string    `json:"store_name"`
	Notes        *string    `json:"notes"`
	OrderDetails *string    `json:"order_details"`
	MixName      *string    `json:"mix_name"`
}
