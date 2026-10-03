-- +goose Up
-- Старые данные app_state (singleton) не переносятся:
-- фронт при загрузке восстанавливает прогресс из localStorage и запушит в БД заново.

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login TEXT UNIQUE,
    password_hash TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

DROP TABLE app_state;

CREATE TABLE app_state (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE app_state;
CREATE TABLE app_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO app_state (id, data)
VALUES (1, '{"solved":[],"sessions":[],"code":{},"layout":{"sidebar":280,"leftPane":420}}'::jsonb);
DROP TABLE sessions;
DROP TABLE users;
