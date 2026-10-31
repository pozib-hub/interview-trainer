-- +goose Up
-- Машинный код причины сбоя задачи (см. proposal.Code* в backend):
-- фронт и дебаг ветвятся по нему, а не по человекочитаемому error.
ALTER TABLE llm_jobs ADD COLUMN error_code TEXT;

-- +goose Down
ALTER TABLE llm_jobs DROP COLUMN error_code;
