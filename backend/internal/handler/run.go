package handler

import (
	"net/http"
)

// maxRunCodeLen — лимит размера пользовательского кода (как в hint/review).
const maxRunCodeLen = 100000

type runRequest struct {
	TaskID string `json:"taskId"`
	Code   string `json:"code"`
}

func (h *Handler) Run(w http.ResponseWriter, r *http.Request) {
	var req runRequest
	// decodeJSON ограничивает тело 1 МБ — без лимита запрос исчерпывает память.
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if req.TaskID == "" {
		writeError(w, http.StatusBadRequest, "Требуются taskId и code")
		return
	}
	if len(req.Code) > maxRunCodeLen {
		writeError(w, http.StatusBadRequest, "Код слишком большой")
		return
	}
	result, _ := h.run.Run(r.Context(), req.TaskID, req.Code)
	writeJSON(w, http.StatusOK, result)
}
