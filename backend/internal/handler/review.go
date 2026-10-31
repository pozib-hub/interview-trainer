package handler

import (
	"context"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/review"
)

// TaskReview обрабатывает POST /api/task-review: ИИ-разбор кода после решения.
// Выполняется фоновой задачей — результат забирается поллингом /api/jobs/{id}.
func (h *Handler) TaskReview(w http.ResponseWriter, r *http.Request) {
	var req review.Request
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

	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindReview, req, func(ctx context.Context) (any, error) {
		return h.review.Ask(ctx, req)
	})
	if err != nil {
		h.log.Error("start review job failed", "taskId", req.TaskID, "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить ревью")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}
