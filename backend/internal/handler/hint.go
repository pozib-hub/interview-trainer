package handler

import (
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/hint"
)

// TaskHint обрабатывает POST /api/task-hint: подсказка от ИИ по ходу решения.
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

	res, err := h.hint.Ask(r.Context(), req)
	if err != nil {
		h.log.Error("task hint failed", "taskId", req.TaskID, "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось получить подсказку: "+err.Error())
		return
	}
	writeJSON(w, http.StatusOK, res)
}
