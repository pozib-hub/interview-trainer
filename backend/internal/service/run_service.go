package service

import (
	"context"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/runner"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/scanner"
)

type RunService struct {
	scanner *scanner.Scanner
	runner  runner.CodeRunner
}

func NewRunService(s *scanner.Scanner, r runner.CodeRunner) *RunService {
	return &RunService{scanner: s, runner: r}
}

func (s *RunService) Run(ctx context.Context, taskID, code string) (domain.RunResult, bool) {
	task, ok := s.scanner.GetTask(taskID)
	if !ok {
		return domain.RunResult{
			TaskID:     taskID,
			Passed:     false,
			Assertions: []domain.TestAssertion{},
			Stderr:     "Задача \"" + taskID + "\" не найдена",
		}, false
	}
	return s.runner.Run(ctx, task, code), true
}
