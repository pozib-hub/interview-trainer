package server

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/auth"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/handler"
	appmw "github.com/pozib-hub/interview-trainer-v2/backend/internal/middleware"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage"
)

type Deps struct {
	Env           string
	Addr          string
	Log           *slog.Logger
	H             *handler.Handler
	Users         storage.UserRepository
	Sessions      storage.SessionRepository
	SecureCookies bool
}

func NewRouter(d Deps) http.Handler {
	r := chi.NewRouter()

	r.Use(chimw.RequestID)
	r.Use(appmw.Recoverer(d.Log))
	r.Use(appmw.Logger(d.Log))

	if d.Env != "prod" {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins: []string{"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"},
			AllowedMethods: []string{"GET", "POST", "OPTIONS"},
			AllowedHeaders: []string{"Content-Type", "X-Request-Id"},
		}))
	}

	r.Get("/api/health", d.H.Health)

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(auth.Deps{
			Users:    d.Users,
			Sessions: d.Sessions,
			Secure:   d.SecureCookies,
		}))

		r.Get("/api/tasks", d.H.Tasks)
		r.Get("/api/task/*", d.H.Task)
		r.Post("/api/run", d.H.Run)
		r.Post("/api/task-proposal", d.H.ProposeTask)
		r.Post("/api/task-hint", d.H.TaskHint)
		r.Post("/api/task-review", d.H.TaskReview)

		r.Get("/api/data", d.H.GetData)
		r.Post("/api/data", d.H.PatchData)

		r.Post("/api/auth/register", d.H.Register)
		r.Post("/api/auth/login", d.H.Login)
		r.Post("/api/auth/logout", d.H.Logout)
		r.Get("/api/auth/me", d.H.Me)
	})

	return r
}

func New(d Deps) *http.Server {
	return &http.Server{
		Addr:              d.Addr,
		Handler:           NewRouter(d),
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       30 * time.Second,
		// 300s: генерация задачи через LLM (с retry) может занимать пару минут.
		WriteTimeout: 300 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
}
