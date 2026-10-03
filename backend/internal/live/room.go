package live

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

const (
	keepaliveInterval = 30 * time.Second
	pongWait          = 70 * time.Second
	writeWait         = 10 * time.Second
	maxMessageSize    = 1 << 20
	chatHistory       = 50
	roomIdleTTL       = 10 * time.Minute
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		return true // комнаты идентифицируются случайным кодом
	},
}

// Room — комната лайвкодинга.
type Room struct {
	ID   string
	Task domain.TaskFull

	mu         sync.Mutex
	conns      map[*conn]struct{}
	driver     *conn
	content    string
	chat       []ChatMsg
	lastRun    *domain.RunResult
	lastActive time.Time
	created    time.Time
	running    bool
}

type ChatMsg struct {
	From string `json:"from"`
	Text string `json:"text"`
	At   int64  `json:"at"`
}

type conn struct {
	ws    *websocket.Conn
	send  chan []byte
	name  string
	id    string
	room  *Room
	close sync.Once
}

// ─── Сообщения протокола ──────────────────────────────────────────────────

// clientMessage — входящее от клиента.
type clientMessage struct {
	Type    string `json:"type"` // join | code | take_wheel | run | chat
	Name    string `json:"name,omitempty"`
	Content string `json:"content,omitempty"`
	Text    string `json:"text,omitempty"`
}

// taskMsg — статичная информация о задаче (отправляется один раз при входе).
type taskMsg struct {
	Type string           `json:"type"`
	Task domain.TaskFull `json:"task"`
}

// stateMsg — полное состояние комнаты (при любом изменении).
type stateMsg struct {
	Type         string              `json:"type"`
	RoomID       string              `json:"roomId"`
	Participants []Participant       `json:"participants"`
	DriverID     string              `json:"driverId"`
	Content      string              `json:"content"`
	Running      bool               `json:"running"`
	LastRun      *domain.RunResult   `json:"lastRun,omitempty"`
}

type Participant struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// chatMsg — одно сообщение чата.
type chatMsgWire struct {
	Type string  `json:"type"`
	Msg  ChatMsg `json:"msg"`
}

// ─── Жизненный цикл комнаты ───────────────────────────────────────────────

func (r *Room) join(c *conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.conns[c] = struct{}{}
	r.lastActive = time.Now()
	if r.driver == nil {
		r.driver = c
	}
}

func (r *Room) leave(c *conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.conns, c)
	r.lastActive = time.Now()
	if r.driver == c {
		r.driver = nil
		for other := range r.conns {
			r.driver = other
			break
		}
	}
}

func (r *Room) buildState() stateMsg {
	r.mu.Lock()
	defer r.mu.Unlock()
	participants := make([]Participant, 0, len(r.conns))
	for c := range r.conns {
		participants = append(participants, Participant{ID: c.id, Name: c.name})
	}
	driverID := ""
	if r.driver != nil {
		driverID = r.driver.id
	}
	return stateMsg{
		Type:         "state",
		RoomID:       r.ID,
		Participants: participants,
		DriverID:     driverID,
		Content:      r.content,
		Running:      r.running,
		LastRun:      r.lastRun,
	}
}

// broadcast рассылает состояние всем участникам.
func (r *Room) broadcastState() {
	data, err := json.Marshal(r.buildState())
	if err != nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	for c := range r.conns {
		select {
		case c.send <- data:
		default: // медленный клиент — не блокируем комнату
		}
	}
}

// ─── HTTP/WS обработчики ───────────────────────────────────────────────────

// HandleCreateRoom обрабатывает POST /api/live/rooms {taskId} → {roomId}.
func (h *Hub) HandleCreateRoom(w http.ResponseWriter, req *http.Request) {
	var body struct {
		TaskID string `json:"taskId"`
	}
	if err := json.NewDecoder(req.Body).Decode(&body); err != nil || body.TaskID == "" {
		http.Error(w, `{"error":"требуется taskId"}`, http.StatusBadRequest)
		return
	}
	room, err := h.CreateRoom(body.TaskID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"roomId": room.ID})
}

// HandleWS обрабатывает GET /ws/live/{roomId}?name=...
func (h *Hub) HandleWS(w http.ResponseWriter, req *http.Request) {
	rid := chi.URLParam(req, "roomId")
	room, ok := h.GetRoom(rid)
	if !ok {
		http.Error(w, `{"error":"комната не найдена"}`, http.StatusNotFound)
		return
	}

	name := req.URL.Query().Get("name")
	if name == "" {
		name = "Гость-" + roomID()[:4]
	}

	ws, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		h.log.Error("ws upgrade failed", "room", room.ID, "error", err)
		return
	}

	c := &conn{
		ws:   ws,
		send: make(chan []byte, 64),
		name:  name,
		id:    roomID(),
		room:  room,
	}
	room.join(c)
	h.log.Info("live join", "room", room.ID, "name", name)

	// Статичная информация о задаче + собственный id + текущее состояние.
	if data, err := json.Marshal(taskMsg{Type: "task", Task: room.Task}); err == nil {
		select {
		case c.send <- data:
		default:
		}
	}
	if data, err := json.Marshal(struct {
		Type string `json:"type"`
		ID   string `json:"id"`
	}{Type: "hello", ID: c.id}); err == nil {
		select {
		case c.send <- data:
		default:
		}
	}
	room.broadcastState()

	go c.writePump()
	c.readPump(h)
}

// readPump читает сообщения клиента до закрытия.
func (c *conn) readPump(h *Hub) {
	defer func() {
		c.close.Do(func() { c.ws.Close() })
		c.room.leave(c)
		c.room.broadcastState()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	_ = c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		return c.ws.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, raw, err := c.ws.ReadMessage()
		if err != nil {
			return
		}
		var msg clientMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			continue
		}
		switch msg.Type {
		case "code":
			r := c.room
			r.mu.Lock()
			isDriver := r.driver == c
			if isDriver {
				r.content = msg.Content
			}
			r.mu.Unlock()
			if isDriver {
				c.room.broadcastState()
			}
		case "take_wheel":
			r := c.room
			r.mu.Lock()
			r.driver = c
			r.lastActive = time.Now()
			r.mu.Unlock()
			r.broadcastState()
		case "run":
			h.startRun(c)
		case "chat":
			text := []rune(msg.Text)
			if len(text) > 500 {
				text = text[:500]
			}
			msg := ChatMsg{From: c.name, Text: string(text), At: time.Now().UnixMilli()}
			r := c.room
			r.mu.Lock()
			r.chat = append(r.chat, msg)
			if len(r.chat) > chatHistory {
				r.chat = r.chat[len(r.chat)-chatHistory:]
			}
			r.mu.Unlock()
			if data, err := json.Marshal(chatMsgWire{Type: "chat", Msg: msg}); err == nil {
				r.mu.Lock()
				for other := range r.conns {
					select {
					case other.send <- data:
					default:
					}
				}
				r.mu.Unlock()
			}
		}
	}
}

// startRun запускает тесты от имени ведущего; результат видят все.
func (h *Hub) startRun(c *conn) {
	r := c.room
	r.mu.Lock()
	if r.running || r.driver != c {
		r.mu.Unlock()
		return
	}
	r.running = true
	content := r.content
	r.mu.Unlock()
	r.broadcastState()

	go func() {
		result := h.runner.Run(context.Background(), r.Task, content)
		r.mu.Lock()
		r.running = false
		r.lastRun = &result
		r.mu.Unlock()
		r.broadcastState()
	}()
}

// writePump отправляет сообщения и ping-keepalive.
func (c *conn) writePump() {
	ticker := time.NewTicker(keepaliveInterval)
	defer ticker.Stop()
	for {
		select {
		case data, ok := <-c.send:
			_ = c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.ws.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
				return
			}
			if err := c.ws.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.ws.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ─── Утилиты ───────────────────────────────────────────────────────────────

// roomID — короткий однозначно читаемый код комнаты.
func roomID() string {
	const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
	out := make([]byte, 6)
	for i := range out {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		out[i] = alphabet[n.Int64()]
	}
	return string(out)
}
