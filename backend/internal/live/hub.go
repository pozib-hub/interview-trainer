// Package live — режим лайвкодинга: комнаты, где один участник «за клавиатурой»
// пишет код, а остальные видят его в реальном времени (мок-собеседование).
package live

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

// TaskSource — источник задач (реализация *scanner.Scanner).
type TaskSource interface {
	GetTask(id string) (domain.TaskFull, bool)
}

// TaskRunner — витес-раннер (реализация *runner.VitestRunner).
type TaskRunner interface {
	Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult
}

// Hub хранит активные комнаты в памяти.
type Hub struct {
	mu     sync.Mutex
	rooms  map[string]*Room
	tasks  TaskSource
	runner TaskRunner
	log    *slog.Logger
}

func NewHub(tasks TaskSource, runner TaskRunner, log *slog.Logger) *Hub {
	h := &Hub{
		rooms:  make(map[string]*Room),
		tasks:  tasks,
		runner: runner,
		log:    log,
	}
	go h.janitor()
	return h
}

// CreateRoom создаёт комнату для задачи (код стартует с шаблона).
func (h *Hub) CreateRoom(taskID string) (*Room, error) {
	task, ok := h.tasks.GetTask(taskID)
	if !ok {
		return nil, fmt.Errorf("задача не найдена")
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	id := roomID()
	h.rooms[id] = &Room{
		ID:         id,
		Task:       task,
		content:    task.Template,
		conns:      make(map[*conn]struct{}),
		created:    time.Now(),
		lastActive: time.Now(),
	}
	h.log.Info("live room created", "room", id, "taskId", taskID)
	return h.rooms[id], nil
}

// GetRoom возвращает комнату по ID.
func (h *Hub) GetRoom(id string) (*Room, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	r, ok := h.rooms[id]
	return r, ok
}

// janitor удаляет пустые комнаты старше 10 минут.
func (h *Hub) janitor() {
	for range time.Tick(time.Minute) {
		h.mu.Lock()
		for id, r := range h.rooms {
			r.mu.Lock()
			empty := len(r.conns) == 0 && time.Since(r.lastActive) > 10*time.Minute
			r.mu.Unlock()
			if empty {
				delete(h.rooms, id)
			}
		}
		h.mu.Unlock()
	}
}
