package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/config"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/handler"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/hint"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/review"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/runner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/scanner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/server"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/service"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/storage/postgres"
)

func main() {
	if err := run(); err != nil {
		slog.Error("fatal", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	log := newLogger(cfg.Env)
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := postgres.Migrate(ctx, cfg.DatabaseURL); err != nil {
		return err
	}
	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	users := postgres.NewUserRepo(pool)
	sessions := postgres.NewSessionRepo(pool)
	states := postgres.NewStateRepo(pool)

	taskScanner := scanner.New(cfg.TasksDir)
	codeRunner, err := runner.NewVitestRunner(cfg.NodeBin, cfg.RuntimeDir, cfg.RunTimeout)
	if err != nil {
		return err
	}

	proposalSvc := proposal.NewService(proposal.Options{
		TasksRoot:  cfg.TasksDir,
		Runner:     codeRunner,
		LLM:        proposal.NewLLMClient(cfg.LLMBaseURL, cfg.LLMModel, cfg.LLMAPIKey, time.Duration(cfg.LLMTimeoutMS)*time.Millisecond, cfg.LLMMaxRetries),
		LLMMock:    cfg.LLMMock,
		GitHub:     proposal.NewGitHubClient(cfg.GitHubAPIBase, cfg.GitHubToken, cfg.GitHubRepo, 60*time.Second),
		DryRun:     cfg.ProposalDryRun,
		BaseBranch: cfg.ProposalBaseBranch,
		Log:        log,
	})

	hintSvc := &hint.Service{
		LLM:   proposal.NewLLMClient(cfg.LLMBaseURL, cfg.LLMModel, cfg.LLMAPIKey, time.Duration(cfg.LLMTimeoutMS)*time.Millisecond, cfg.LLMMaxRetries),
		Tasks: taskScanner,
		Run:   codeRunner,
		Mock:  cfg.LLMMock,
	}

	reviewSvc := &review.Service{
		LLM:   proposal.NewLLMClient(cfg.LLMBaseURL, cfg.LLMModel, cfg.LLMAPIKey, time.Duration(cfg.LLMTimeoutMS)*time.Millisecond, cfg.LLMMaxRetries),
		Tasks: taskScanner,
		Run:   codeRunner,
		Mock:  cfg.LLMMock,
	}

	h := handler.New(
		service.NewTaskService(taskScanner),
		service.NewStateService(states),
		service.NewRunService(taskScanner, codeRunner),
		service.NewAuthService(users, sessions, states),
		proposalSvc,
		hintSvc,
		reviewSvc,
		users,
		sessions,
		cfg.CookieSecure,
		log,
	)

	srv := server.New(server.Deps{
		Env:           cfg.Env,
		Addr:          cfg.HTTPAddr,
		Log:           log,
		H:             h,
		Users:         users,
		Sessions:      sessions,
		SecureCookies: cfg.CookieSecure,
	})

	errCh := make(chan error, 1)
	go func() {
		log.Info("server started", "addr", cfg.HTTPAddr, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", "error", err)
	}
	log.Info("server stopped")
	return nil
}

func newLogger(env string) *slog.Logger {
	if env == "prod" {
		return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	}
	return slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
}
