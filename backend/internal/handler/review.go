package handler

import (
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/review"
)

// TaskReview обрабатывает POST /api/task-review: ИИ-разбор кода после решения.
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

	res, err := h.review.Ask(r.Context(), req)
	if err != nil {
		h.log.Error("task review failed", "taskId", req.TaskID, "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось получить ревью: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, res)
}
