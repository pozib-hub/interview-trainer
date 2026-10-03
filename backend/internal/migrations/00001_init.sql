-- +goose Up
CREATE TABLE app_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO app_state (id, data)
VALUES (1, '{"solved":[],"sessions":[],"code":{},"layout":{"sidebar":280,"leftPane":420}}'::jsonb);

-- +goose Down
DROP TABLE app_state;
