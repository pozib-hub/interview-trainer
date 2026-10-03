package service

import (
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/scanner"
)

type TaskService struct {
	scanner *scanner.Scanner
}

func NewTaskService(s *scanner.Scanner) *TaskService {
	return &TaskService{scanner: s}
}

func (s *TaskService) ListTasks() []domain.TaskSummary {
	return s.scanner.ListTasks()
}

func (s *TaskService) TasksByTopic() map[string][]domain.TaskSummary {
	topics := map[string][]domain.TaskSummary{}
	for _, t := range s.scanner.ListTasks() {
		topics[t.Topic] = append(topics[t.Topic], t)
	}
	return topics
}

func (s *TaskService) GetTask(id string) (domain.TaskFull, bool) {
	return s.scanner.GetTask(id)
}
