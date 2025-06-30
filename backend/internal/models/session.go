package models

import (
	"time"
)

type ShishaSession struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"user_id" db:"user_id"`
	CreatedBy    string    `json:"created_by" db:"created_by"`
	SessionDate  time.Time `json:"session_date" db:"session_date"`
	StoreName    *string   `json:"store_name" db:"store_name"`
	Notes        *string   `json:"notes" db:"notes"`
	OrderDetails *string   `json:"order_details" db:"order_details"`
	MixName      *string   `json:"mix_name" db:"mix_name"`
	Creator      *string   `json:"creator" db:"creator"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type SessionFlavor struct {
	ID          string    `json:"id" db:"id"`
	SessionID   string    `json:"session_id" db:"session_id"`
	FlavorName  *string   `json:"flavor_name" db:"flavor_name"`
	Brand       *string   `json:"brand" db:"brand"`
	FlavorOrder int       `json:"flavor_order" db:"flavor_order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type SessionWithFlavors struct {
	ShishaSession
	Flavors []SessionFlavor `json:"flavors"`
}

type CreateSessionRequest struct {
	SessionDate  time.Time              `json:"session_date" validate:"required"`
	StoreName    *string                `json:"store_name"`
	Notes        *string                `json:"notes"`
	OrderDetails *string                `json:"order_details"`
	MixName      *string                `json:"mix_name"`
	Creator      *string                `json:"creator"`
	Flavors      *[]CreateFlavorRequest `json:"flavors"`
}

type CreateFlavorRequest struct {
	FlavorName *string `json:"flavor_name"`
	Brand      *string `json:"brand"`
}

type UpdateSessionRequest struct {
	SessionDate  *time.Time             `json:"session_date"`
	StoreName    *string                `json:"store_name"`
	Notes        *string                `json:"notes"`
	OrderDetails *string                `json:"order_details"`
	MixName      *string                `json:"mix_name"`
	Creator      *string                `json:"creator"`
	Flavors      *[]CreateFlavorRequest `json:"flavors"`
}

type StoreCount struct {
	StoreName string `json:"store_name"`
	Count     int    `json:"count"`
}

type CreatorCount struct {
	Creator string `json:"creator"`
	Count   int    `json:"count"`
}

type StoreStats struct {
	Stores []StoreCount `json:"stores"`
}

type CreatorStats struct {
	Creators []CreatorCount `json:"creators"`
}

type OrderCount struct {
	OrderDetails string `json:"order_details"`
	Count        int    `json:"count"`
}

type OrderStats struct {
	Orders []OrderCount `json:"orders"`
}
