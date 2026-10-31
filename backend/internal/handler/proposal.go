package handler

import (
	"context"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// ProposeTask обрабатывает POST /api/task-proposal: форма → LLM → тесты → PR.
// Выполняется фоновой задачей (это самая долгая операция: генерация +
// прогоны vitest + GitHub API) — результат забирается поллингом /api/jobs/{id}.
func (h *Handler) ProposeTask(w http.ResponseWriter, r *http.Request) {
	var req proposal.Input
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if err := h.proposal.ValidateInput(req); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindTaskProposal, req, func(ctx context.Context) (any, error) {
		return h.proposal.Propose(ctx, req)
	})
	if err != nil {
		h.log.Error("start task proposal job failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить генерацию задачи")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}
