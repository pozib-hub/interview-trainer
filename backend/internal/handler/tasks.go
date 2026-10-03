package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

func (h *Handler) Tasks(w http.ResponseWriter, r *http.Request) {
	tasks := h.tasks.ListTasks()
	if tasks == nil {
		tasks = []domain.TaskSummary{}
	}
	topics := map[string][]domain.TaskSummary{}
	for _, t := range tasks {
		topics[t.Topic] = append(topics[t.Topic], t)
	}
	writeJSON(w, http.StatusOK, map[string]any{"tasks": tasks, "topics": topics})
}

func (h *Handler) Task(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "*")
	task, ok := h.tasks.GetTask(id)
	if !ok {
		writeError(w, http.StatusNotFound, "Задача не найдена")
		return
	}
	writeJSON(w, http.StatusOK, task)
}
