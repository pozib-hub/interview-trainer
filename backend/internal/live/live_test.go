package live

import (
	"io"
	"log/slog"
	"strings"
	"testing"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type fakeTasks struct{ task domain.TaskFull }

func (f *fakeTasks) GetTask(id string) (domain.TaskFull, bool) {
	return f.task, f.task.ID == id
}

func newTestHub(t *testing.T) *Hub {
	t.Helper()
	task := domain.TaskFull{
		TaskSummary: domain.TaskSummary{ID: "algorithms/010-foo", Title: "Foo"},
		Template:    "export function foo() {}",
	}
	return NewHub(&fakeTasks{task: task}, nil, slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func TestCreateRoom(t *testing.T) {
	h := newTestHub(t)
	room, err := h.CreateRoom("algorithms/010-foo")
	if err != nil {
		t.Fatal(err)
	}
	if room.ID == "" || len(room.ID) != 6 {
		t.Errorf("код комнаты должен быть 6 символов: %q", room.ID)
	}
	room.mu.Lock()
	content, connsLen := room.content, len(room.conns)
	room.mu.Unlock()
	if content != "export function foo() {}" {
		t.Errorf("код комнаты должен начинаться с шаблона: %q", content)
	}
	if connsLen != 0 {
		t.Errorf("новая комната должна быть пустой, участников: %d", connsLen)
	}
}

func TestCreateRoom_TaskNotFound(t *testing.T) {
	h := newTestHub(t)
	if _, err := h.CreateRoom("no/such-task"); err == nil {
		t.Error("несуществующая задача должна давать ошибку")
	}
}

func TestCreateRoom_EmptySession(t *testing.T) {
	h := newTestHub(t)
	room, err := h.CreateRoom("")
	if err != nil {
		t.Fatal(err)
	}
	room.mu.Lock()
	taskID, content := room.Task.ID, room.content
	room.mu.Unlock()
	if taskID != "" {
		t.Errorf("пустая сессия не должна содержать задачу, получено %q", taskID)
	}
	if content != "" {
		t.Errorf("код пустой сессии должен быть пустым: %q", content)
	}
}

func TestRoomIDAlphabet(t *testing.T) {
	seen := make(map[string]bool)
	for i := 0; i < 100; i++ {
		id := roomID()
		if len(id) != 6 {
			t.Fatalf("длина кода = %d, хочет 6", len(id))
		}
		if seen[id] {
			// Коллизии на 100 кодах из 31^6 практически невозможны.
			t.Fatalf("коллизия кода комнаты: %s", id)
		}
		seen[id] = true
		for _, ch := range id {
			if !strings.ContainsRune("abcdefghjkmnpqrstuvwxyz23456789", ch) {
				t.Fatalf("недопустимый символ %q в коде %s", ch, id)
			}
		}
	}
}

func TestGetRoom(t *testing.T) {
	h := newTestHub(t)
	room, _ := h.CreateRoom("algorithms/010-foo")
	if got, ok := h.GetRoom(room.ID); !ok || got != room {
		t.Error("GetRoom должен возвращать созданную комнату")
	}
	if _, ok := h.GetRoom("nope"); ok {
		t.Error("несуществующая комната не должна находиться")
	}
}
