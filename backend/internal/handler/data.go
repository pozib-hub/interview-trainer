package handler

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

func (h *Handler) GetData(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	data, err := h.state.GetData(r.Context(), user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Не удалось прочитать прогресс")
		return
	}
	writeJSON(w, http.StatusOK, data)
}

func (h *Handler) PatchData(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	body, err := io.ReadAll(io.LimitReader(r.Body, 10<<20))
	if err != nil {
		writeError(w, http.StatusBadRequest, "Не удалось прочитать тело запроса")
		return
	}
	var patch json.RawMessage
	if err := json.Unmarshal(body, &patch); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if string(patch) == "null" {
		writeError(w, http.StatusBadRequest, "Ожидался объект")
		return
	}
	data, err := h.state.PatchData(r.Context(), user.ID, patch)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidPatch) {
			writeError(w, http.StatusBadRequest, "Неверный формат данных")
			return
		}
		writeError(w, http.StatusInternalServerError, "Не удалось сохранить прогресс")
		return
	}
	writeJSON(w, http.StatusOK, data)
}
