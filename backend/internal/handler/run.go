package handler

import (
	"encoding/json"
	"net/http"
)

type runRequest struct {
	TaskID string `json:"taskId"`
	Code   string `json:"code"`
}

func (h *Handler) Run(w http.ResponseWriter, r *http.Request) {
	var req runRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if req.TaskID == "" {
		writeError(w, http.StatusBadRequest, "Требуются taskId и code")
		return
	}
	result, _ := h.run.Run(r.Context(), req.TaskID, req.Code)
	writeJSON(w, http.StatusOK, result)
}
