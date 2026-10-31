package handler

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type userQuestionRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Category string `json:"category"`
}

func (h *Handler) MyQuestions(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	items, err := h.userQuestions.List(r.Context(), user.ID)
	if err != nil {
		h.log.Error("list user questions failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось загрузить вопросы")
		return
	}
	if items == nil {
		items = []domain.UserQuestion{}
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateUserQuestion(w http.ResponseWriter, r *http.Request) {
	var req userQuestionRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	item, err := h.userQuestions.Create(r.Context(), currentUser(r).ID, req.Question, req.Answer, req.Category)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) UpdateUserQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req userQuestionRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	item, err := h.userQuestions.Update(r.Context(), id, currentUser(r).ID, req.Question, req.Answer, req.Category)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			writeError(w, http.StatusNotFound, "Вопрос не найден")
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handler) DeleteUserQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.userQuestions.Delete(r.Context(), id, currentUser(r).ID); err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			writeError(w, http.StatusNotFound, "Вопрос не найден")
			return
		}
		h.log.Error("delete user question failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось удалить вопрос")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
