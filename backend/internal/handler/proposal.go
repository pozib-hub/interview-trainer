package handler

import (
	"errors"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// ProposeTask обрабатывает POST /api/task-proposal: форма → LLM → PR.
func (h *Handler) ProposeTask(w http.ResponseWriter, r *http.Request) {
	var req proposal.Input
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}

	res, err := h.proposal.Propose(r.Context(), req)
	if err != nil {
		if errors.Is(err, proposal.ErrInvalidInput) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		h.log.Error("task proposal failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось сгенерировать задачу: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, res)
}
