package handler

import (
	"context"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/hint"
)

// TaskHint обрабатывает POST /api/task-hint: подсказка от ИИ по ходу решения.
// Выполняется фоновой задачей — результат забирается поллингом /api/jobs/{id}.
func (h *Handler) TaskHint(w http.ResponseWriter, r *http.Request) {
	var req hint.Request
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if req.TaskID == "" {
		writeError(w, http.StatusBadRequest, "Требуется taskId")
		return
	}
	if len(req.Code) > 100000 {
		writeError(w, http.StatusBadRequest, "Код слишком большой")
		return
	}
	if len(req.PreviousHints) > 50 {
		req.PreviousHints = req.PreviousHints[len(req.PreviousHints)-50:]
	}

	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindHint, req, func(ctx context.Context) (any, error) {
		return h.hint.Ask(ctx, req)
	})
	if err != nil {
		h.log.Error("start hint job failed", "taskId", req.TaskID, "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить подсказку")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}
