-- +goose Up
-- Универсальные фоновые задачи для всех длительных LLM-операций.
ALTER TABLE question_jobs RENAME TO llm_jobs;
ALTER INDEX idx_question_jobs_user_id RENAME TO idx_llm_jobs_user_id;
ALTER TABLE llm_jobs DROP CONSTRAINT question_jobs_kind_check;
ALTER TABLE llm_jobs ADD CONSTRAINT llm_jobs_kind_check
    CHECK (kind IN ('plan', 'analyze', 'task_proposal', 'hint', 'review', 'question_proposal'));

-- +goose Down
ALTER TABLE llm_jobs DROP CONSTRAINT llm_jobs_kind_check;
ALTER TABLE llm_jobs ADD CONSTRAINT question_jobs_kind_check CHECK (kind IN ('plan', 'analyze'));
ALTER INDEX idx_llm_jobs_user_id RENAME TO idx_question_jobs_user_id;
ALTER TABLE llm_jobs RENAME TO question_jobs;
