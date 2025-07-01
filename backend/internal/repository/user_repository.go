package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/toof-jp/shisha-log/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(userID, passwordHash string) (*models.User, error) {
	user := &models.User{
		ID:           uuid.New(),
		UserID:       userID,
		PasswordHash: passwordHash,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `
		INSERT INTO users (id, user_id, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, password_hash, created_at, updated_at
	`

	err := r.db.QueryRow(query, user.ID, user.UserID, user.PasswordHash, user.CreatedAt, user.UpdatedAt).
		Scan(&user.ID, &user.UserID, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, user_id, password_hash, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := r.db.QueryRow(query, id).
		Scan(&user.ID, &user.UserID, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByUserID(userID string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, user_id, password_hash, created_at, updated_at
		FROM users
		WHERE user_id = $1
	`

	err := r.db.QueryRow(query, userID).
		Scan(&user.ID, &user.UserID, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) Update(user *models.User) error {
	query := `
		UPDATE users
		SET user_id = $2, updated_at = $3
		WHERE id = $1
	`

	_, err := r.db.Exec(query, user.ID, user.UserID, time.Now())
	return err
}

func (r *UserRepository) UpdatePassword(userID uuid.UUID, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $2, updated_at = $3
		WHERE id = $1
	`

	_, err := r.db.Exec(query, userID, passwordHash, time.Now())
	return err
}

// Password Reset Token methods

func (r *UserRepository) CreatePasswordResetToken(userID uuid.UUID, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(query, uuid.New(), userID, token, expiresAt, time.Now())
	return err
}

func (r *UserRepository) GetPasswordResetToken(token string) (*models.PasswordResetToken, error) {
	resetToken := &models.PasswordResetToken{}
	query := `
		SELECT id, user_id, token, expires_at, used, created_at
		FROM password_reset_tokens
		WHERE token = $1 AND used = false AND expires_at > NOW()
	`

	err := r.db.QueryRow(query, token).
		Scan(&resetToken.ID, &resetToken.UserID, &resetToken.Token, &resetToken.ExpiresAt, &resetToken.Used, &resetToken.CreatedAt)
	if err != nil {
		return nil, err
	}

	return resetToken, nil
}

func (r *UserRepository) MarkPasswordResetTokenUsed(token string) error {
	query := `
		UPDATE password_reset_tokens
		SET used = true
		WHERE token = $1
	`

	_, err := r.db.Exec(query, token)
	return err
}

// Refresh Token methods

func (r *UserRepository) CreateRefreshToken(userID uuid.UUID, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := r.db.Exec(query, uuid.New(), userID, token, expiresAt, time.Now())
	return err
}

func (r *UserRepository) GetRefreshToken(token string) (*models.RefreshToken, error) {
	refreshToken := &models.RefreshToken{}
	query := `
		SELECT id, user_id, token, expires_at, created_at, used_at, revoked_at
		FROM refresh_tokens
		WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()
	`

	err := r.db.QueryRow(query, token).
		Scan(&refreshToken.ID, &refreshToken.UserID, &refreshToken.Token,
			&refreshToken.ExpiresAt, &refreshToken.CreatedAt,
			&refreshToken.UsedAt, &refreshToken.RevokedAt)
	if err != nil {
		return nil, err
	}

	return refreshToken, nil
}

func (r *UserRepository) UpdateRefreshTokenUsedAt(token string) error {
	query := `
		UPDATE refresh_tokens
		SET used_at = NOW()
		WHERE token = $1
	`

	_, err := r.db.Exec(query, token)
	return err
}

func (r *UserRepository) RevokeRefreshToken(token string) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = NOW()
		WHERE token = $1
	`

	_, err := r.db.Exec(query, token)
	return err
}

func (r *UserRepository) RevokeAllUserRefreshTokens(userID uuid.UUID) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = NOW()
		WHERE user_id = $1 AND revoked_at IS NULL
	`

	_, err := r.db.Exec(query, userID)
	return err
}
