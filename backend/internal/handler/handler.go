package handler

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/service"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage"
)

type Handler struct {
	tasks         *service.TaskService
	state         *service.StateService
	run           *service.RunService
	auth          *service.AuthService
	users         storage.UserRepository
	sessions      storage.SessionRepository
	secureCookies bool
}

func New(
	tasks *service.TaskService,
	state *service.StateService,
	run *service.RunService,
	auth *service.AuthService,
	users storage.UserRepository,
	sessions storage.SessionRepository,
	secureCookies bool,
) *Handler {
	return &Handler{
		tasks:         tasks,
		state:         state,
		run:           run,
		auth:          auth,
		users:         users,
		sessions:      sessions,
		secureCookies: secureCookies,
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
