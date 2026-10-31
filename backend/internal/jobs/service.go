// Package jobs — универсальные фоновые задачи для длительных LLM-операций
// (генерация задач, подсказки, ревью, план и разбор устного собеседования,
// предложение вопросов). HTTP-запрос создаёт задачу и сразу отвечает,
// результат забирается поллингом: операция переживает перезагрузку
// страницы и не зависит от таймаутов соединения.
package jobs

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type Store interface {
	Create(ctx context.Context, userID string, kind domain.JobKind, request any) (domain.Job, error)
	Get(ctx context.Context, id, userID string) (domain.Job, error)
	SetRunning(ctx context.Context, id string) error
	SetResult(ctx context.Context, id string, result any) error
	SetError(ctx context.Context, id, errMsg, errorCode string) error
	FailAllPending(ctx context.Context, reason, errorCode string) (int64, error)
}

type Service struct {
	Store   Store
	Log     *slog.Logger
	Timeout time.Duration
}

const defaultTimeout = 15 * time.Minute

func (s *Service) timeout() time.Duration {
	if s.Timeout <= 0 {
		return defaultTimeout
	}
	return s.Timeout
}

// Start создаёт задачу и выполняет fn в фоновой горутине.
// fn получает контекст с таймаутом задачи; её результат (или ошибка)
// записывается в задачу — оригинал ошибки логируется.
func (s *Service) Start(ctx context.Context, userID string, kind domain.JobKind, request any, fn func(ctx context.Context) (any, error)) (domain.Job, error) {
	job, err := s.Store.Create(ctx, userID, kind, request)
	if err != nil {
		return domain.Job{}, fmt.Errorf("создать задачу: %w", err)
	}
	go s.run(job.ID, fn)
	return job, nil
}

func (s *Service) Get(ctx context.Context, id, userID string) (domain.Job, error) {
	job, err := s.Store.Get(ctx, id, userID)
	if err != nil {
		return domain.Job{}, err
	}
	if job.Status == domain.JobPending || job.Status == domain.JobRunning {
		if time.Since(time.UnixMilli(job.UpdatedAt)) > s.timeout() {
			const staleMsg = "Задача выполнялась слишком долго и была остановлена — попробуйте ещё раз"
			_ = s.Store.SetError(context.Background(), id, staleMsg, "timeout")
			job.Status = domain.JobFailed
			job.Error = staleMsg
			job.ErrorCode = "timeout"
		}
	}
	return job, nil
}

func (s *Service) FailAllPending(ctx context.Context, reason, errorCode string) {
	if s.Store == nil {
		return
	}
	if _, err := s.Store.FailAllPending(ctx, reason, errorCode); err != nil {
		s.log().Error("fail pending jobs", "error", err)
	}
}

func (s *Service) run(jobID string, fn func(ctx context.Context) (any, error)) {
	ctx, cancel := context.WithTimeout(context.Background(), s.timeout())
	defer cancel()

	if err := s.Store.SetRunning(ctx, jobID); err != nil {
		s.log().Error("job set running failed", "job", jobID, "error", err)
		return
	}

	result, err := fn(ctx)
	if err != nil {
		s.log().Warn("job failed", "job", jobID, "error", err)
		// errorCode — машинная причина сбоя (см. proposal.Code*):
		// фронт и дебаг ветвятся по ней, а не по человекочитаемому тексту.
		code := "unknown"
		var coder interface{ ErrorCode() string }
		if errors.As(err, &coder) {
			code = coder.ErrorCode()
		}
		if cerr := s.Store.SetError(context.Background(), jobID, err.Error(), code); cerr != nil {
			s.log().Error("job set error failed", "job", jobID, "error", cerr)
		}
		return
	}
	if err := s.Store.SetResult(context.Background(), jobID, result); err != nil {
		s.log().Error("job set result failed", "job", jobID, "error", err)
	}
}

func (s *Service) log() *slog.Logger {
	if s.Log != nil {
		return s.Log
	}
	return slog.Default()
}
