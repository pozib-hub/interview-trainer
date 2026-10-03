package handler

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/hint"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/service"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage"
)

type Handler struct {
	tasks         *service.TaskService
	state         *service.StateService
	run           *service.RunService
	auth          *service.AuthService
	proposal      *proposal.Service
	hint          *hint.Service
	users         storage.UserRepository
	sessions      storage.SessionRepository
	secureCookies bool
	log           *slog.Logger
}

func New(
	tasks *service.TaskService,
	state *service.StateService,
	run *service.RunService,
	auth *service.AuthService,
	proposalSvc *proposal.Service,
	hintSvc *hint.Service,
	users storage.UserRepository,
	sessions storage.SessionRepository,
	secureCookies bool,
	log *slog.Logger,
) *Handler {
	if log == nil {
		log = slog.Default()
	}
	return &Handler{
		tasks:         tasks,
		state:         state,
		run:           run,
		auth:          auth,
		proposal:      proposalSvc,
		hint:          hintSvc,
		users:         users,
		sessions:      sessions,
		secureCookies: secureCookies,
		log:           log,
	}
}

func decodeJSON(r *http.Request, v any) error {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		return err
	}
	return json.Unmarshal(body, v)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
