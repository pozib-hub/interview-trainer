package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/migrations"
	"github.com/pressly/goose/v3"
)

type StateRepo struct {
	pool *pgxpool.Pool
}

func NewPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return pool, nil
}

func Migrate(ctx context.Context, databaseURL string) error {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return fmt.Errorf("open sql for migrations: %w", err)
	}
	defer db.Close()

	provider, err := goose.NewProvider(goose.DialectPostgres, db, migrations.FS)
	if err != nil {
		return fmt.Errorf("create goose provider: %w", err)
	}
	if _, err := provider.Up(ctx); err != nil {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}

func NewStateRepo(pool *pgxpool.Pool) *StateRepo {
	return &StateRepo{pool: pool}
}

func (r *StateRepo) Get(ctx context.Context, userID string) (domain.AppData, error) {
	var raw []byte
	err := r.pool.QueryRow(ctx, `SELECT data FROM app_state WHERE user_id = $1`, userID).Scan(&raw)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.EmptyAppData(), nil
	}
	if err != nil {
		return domain.AppData{}, fmt.Errorf("select app_state: %w", err)
	}
	return decodeAppData(raw)
}

func (r *StateRepo) Save(ctx context.Context, userID string, data domain.AppData) error {
	raw, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("marshal app_state: %w", err)
	}
	_, err = r.pool.Exec(ctx,
		`INSERT INTO app_state (user_id, data) VALUES ($1, $2)
		 ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = now()`,
		userID, raw)
	if err != nil {
		return fmt.Errorf("save app_state: %w", err)
	}
	return nil
}

func (r *StateRepo) Patch(ctx context.Context, userID string, apply func(current domain.AppData) domain.AppData) (domain.AppData, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return domain.AppData{}, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var raw []byte
	err = tx.QueryRow(ctx, `SELECT data FROM app_state WHERE user_id = $1 FOR UPDATE`, userID).Scan(&raw)
	if errors.Is(err, pgx.ErrNoRows) {
		if _, err := tx.Exec(ctx,
			`INSERT INTO app_state (user_id, data) VALUES ($1, '{}'::jsonb) ON CONFLICT (user_id) DO NOTHING`, userID); err != nil {
			return domain.AppData{}, fmt.Errorf("insert app_state: %w", err)
		}
		err = tx.QueryRow(ctx, `SELECT data FROM app_state WHERE user_id = $1 FOR UPDATE`, userID).Scan(&raw)
	}
	if err != nil {
		return domain.AppData{}, fmt.Errorf("select app_state for update: %w", err)
	}

	current, err := decodeAppData(raw)
	if err != nil {
		return domain.AppData{}, err
	}
	next := apply(current)

	nextRaw, err := json.Marshal(next)
	if err != nil {
		return domain.AppData{}, fmt.Errorf("marshal app_state: %w", err)
	}

	if err := tx.QueryRow(ctx,
		`UPDATE app_state SET data = $1, updated_at = now() WHERE user_id = $2 RETURNING data`,
		nextRaw, userID).Scan(&raw); err != nil {
		return domain.AppData{}, fmt.Errorf("update app_state: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return domain.AppData{}, fmt.Errorf("commit tx: %w", err)
	}
	return decodeAppData(raw)
}

func decodeAppData(raw []byte) (domain.AppData, error) {
	data := domain.EmptyAppData()
	if err := json.Unmarshal(raw, &data); err != nil {
		return domain.AppData{}, fmt.Errorf("decode app_state: %w", err)
	}
	if data.Code == nil {
		data.Code = map[string]string{}
	}
	if data.Solved == nil {
		data.Solved = []string{}
	}
	if data.Sessions == nil {
		data.Sessions = []domain.InterviewSession{}
	}
	return data, nil
}
