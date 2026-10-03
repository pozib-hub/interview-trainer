package runner

import (
	"context"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type CodeRunner interface {
	Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult
}
