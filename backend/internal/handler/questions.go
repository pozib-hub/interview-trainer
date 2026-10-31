package handler

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/question"
)

func (h *Handler) Questions(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, h.questions.Index())
}

func (h *Handler) QuestionInterviewPlan(w http.ResponseWriter, r *http.Request) {
	var req question.PlanRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindPlan, req, func(ctx context.Context) (any, error) {
		return h.questionInterview.Plan(ctx, req)
	})
	if err != nil {
		h.log.Error("start plan job failed", "direction", req.Direction, "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить генерацию плана")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}

func (h *Handler) QuestionInterviewAnalyze(w http.ResponseWriter, r *http.Request) {
	var req []question.AnalyzeItem
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	if len(req) == 0 {
		writeError(w, http.StatusBadRequest, "Нет вопросов с ответами для разбора")
		return
	}
	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindAnalyze, req, func(ctx context.Context) (any, error) {
		return h.questionInterview.Analyze(ctx, req)
	})
	if err != nil {
		h.log.Error("start analyze job failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить разбор ответов")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}

func (h *Handler) QuestionProposal(w http.ResponseWriter, r *http.Request) {
	var req question.ProposalRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "Неверный JSON")
		return
	}
	user := currentUser(r)
	job, err := h.jobs.Start(r.Context(), user.ID, domain.JobKindQuestionProposal, req, func(ctx context.Context) (any, error) {
		return h.questionProposal.Propose(ctx, req)
	})
	if err != nil {
		h.log.Error("start question proposal job failed", "error", err)
		writeError(w, http.StatusInternalServerError, "Не удалось запустить оформление вопроса")
		return
	}
	writeJSON(w, http.StatusAccepted, job)
}

func (h *Handler) Job(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	job, err := h.jobs.Get(r.Context(), id, currentUser(r).ID)
	if err != nil {
		writeError(w, http.StatusNotFound, "Задача не найдена")
		return
	}
	writeJSON(w, http.StatusOK, job)
}
