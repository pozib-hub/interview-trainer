-- +goose Up
-- Фича «свои вопросы» (персональный список) убрана: осталось только
-- предложение вопросов в общий сборник (/api/question-proposal).
DROP TABLE user_questions;

-- +goose Down
CREATE TABLE user_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_questions_user_id ON user_questions(user_id);
