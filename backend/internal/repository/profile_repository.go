package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/supabase-community/supabase-go"
	"github.com/toof-jp/shisha-log/backend/internal/models"
)

type ProfileRepository struct {
	client *supabase.Client
}

func NewProfileRepository(client *supabase.Client) *ProfileRepository {
	return &ProfileRepository{client: client}
}

func (r *ProfileRepository) GetByID(ctx context.Context, id string) (*models.Profile, error) {
	var profiles []models.Profile

	data, _, err := r.client.From("profiles").
		Select("*", "exact", false).
		Eq("id", id).
		Execute()

	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &profiles)
	if err != nil {
		return nil, err
	}

	if len(profiles) == 0 {
		return nil, errors.New("profile not found")
	}

	return &profiles[0], nil
}

func (r *ProfileRepository) Create(ctx context.Context, profile *models.Profile) error {
	_, _, err := r.client.From("profiles").
		Insert(profile, false, "", "", "").
		Execute()

	return err
}

func (r *ProfileRepository) Update(ctx context.Context, id string, displayName string) error {
	update := map[string]interface{}{
		"display_name": displayName,
	}

	_, _, err := r.client.From("profiles").
		Update(update, "", "").
		Eq("id", id).
		Execute()

	return err
}
