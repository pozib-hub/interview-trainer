import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Spinner, Typography } from "@ui/index";
import CodeEditor from "@components/CodeEditor";
import TestResults from "@components/TestResults";
import ConditionPanel from "@components/ConditionPanel";
import TaskPickerModal from "@components/TaskPickerModal";
import { useLiveRoom } from "@hooks/useLiveRoom";
import styles from "./LivePage.module.css";

export default function LivePage() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("it:live-name");
    if (saved) setName(saved);
  }, []);

  const room = useLiveRoom(joined ? roomId : "", name);
  const myId = room.myId;
  const isDriver = !!room.state && !!myId && room.state.driverId === myId;

  const [localCode, setLocalCode] = useState<string | null>(null);
  const codeRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chatText, setChatText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  // Драйвер правит код локально; остальные зеркалят состояние с сервера.
  useEffect(() => {
    if (room.state) setLocalCode((prev) => (isDriver ? prev : room.state!.content));
  }, [room.state, isDriver]);

  // Смена задачи в комнате: у всех код и результат сбрасываются.
  const taskID = room.task?.id;
  useEffect(() => {
    setLocalCode(null);
  }, [taskID]);

  const handleCodeChange = (v: string) => {
    if (!isDriver) return;
    setLocalCode(v);
    codeRef.current = v;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (codeRef.current !== null) room.sendCode(codeRef.current);
    }, 120);
  };

  const handleSendChat = () => {
    const text = chatText.trim();
    if (!text) return;
    room.sendChat(text);
    setChatText("");
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard может быть недоступен
    }
  };

  if (!joined) {
    return (
      <div className={styles.Join}>
        <div className={styles.JoinPanel}>
          <Typography tag="h1" size={18} mb={8}>🎙 Лайвкодинг</Typography>
          <Typography tag="p" color="text-muted" size={13} mb={16}>
            Комната <code>{roomId}</code>. Как тебя называть?
          </Typography>
          <input
            className={styles.JoinInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            maxLength={30}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && setJoined(true)}
            autoFocus
          />
          <div className={styles.JoinActions}>
            <Button size="sm" onClick={() => navigate("/tasks")}>Отмена</Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!name.trim()}
              onClick={() => {
                localStorage.setItem("it:live-name", name.trim());
                setJoined(true);
              }}
            >
              Войти в комнату
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (room.status === "connecting" || (room.status === "connected" && !room.state)) {
    return (
      <div className={styles.Center}>
        <Typography size={16}><Spinner mr={8} />Подключение к комнате…</Typography>
      </div>
    );
  }

  // Задача ещё не выбрана — сессия ждёт выбора.
  if (room.status === "connected" && !room.task) {
    return (
      <div className={styles.Page}>
        <header className={styles.Header}>
          <Button size="sm" href="/tasks">← Выйти</Button>
          <Typography tag="span" size={13} className={styles.TaskTitle}>🎙 Сессия лайвкодинга</Typography>
          <span className={styles.Badge}>комната {roomId}</span>
          <Button size="sm" onClick={copyInvite} title="Скопировать ссылку-приглашение">🔗 Пригласить</Button>
        </header>
        <div className={styles.Center}>
          <Typography tag="h1" size={18} mb={8}>Выберите задачу</Typography>
          <Typography tag="p" color="text-muted" size={13} mb={16}>
            Задачу увидят все участники комнаты. Можно решать сколько угодно задач подряд —
            как на настоящем собеседовании.
          </Typography>
          <Button size="lg" variant="primary" onClick={() => setPickerOpen(true)}>
            ▶ Выбрать задачу
          </Button>
        </div>
        <TaskPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(id) => {
            setPickerOpen(false);
            room.pickTask(id);
          }}
        />
      </div>
    );
  }

  if (room.status === "error" || !room.task || !room.state) {
    return (
      <div className={styles.Center}>
        <Typography tag="h1" size={18} mb={8}>❌ {room.error || "Комната не найдена"}</Typography>
        <Typography tag="p" color="text-muted" size={13} mb={16}>
          Возможно, ссылка устарела или комната уже закрыта.
        </Typography>
        <Button size="sm" href="/tasks">К задачам</Button>
      </div>
    );
  }

  const driver = room.state.participants.find((p) => p.id === room.state!.driverId);
  const code = localCode ?? room.state.content;

  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Button size="sm" href="/tasks">← Выйти</Button>
        <Typography tag="span" size={13} className={styles.TaskTitle}>
          🎙 {room.task.title}
        </Typography>
        <Button size="sm" onClick={() => setPickerOpen(true)} title="Выбрать другую задачу — код начнётся с шаблона">
          ⏭ Другая задача
        </Button>
        <span className={styles.Badge}>комната {roomId}</span>
        <Button size="sm" onClick={copyInvite} title="Скопировать ссылку-приглашение">
          🔗 Пригласить
        </Button>
      </header>

      <div className={styles.Body}>
        <aside className={styles.Side}>
          <div className={styles.SideSection}>
            <Typography tag="span" size={12} color="text-muted">
              Участники ({room.state.participants.length})
            </Typography>
            <div className={styles.Participants}>
              {room.state.participants.map((p) => {
                const driving = p.id === room.state!.driverId;
                return (
                  <div key={p.id} className={`${styles.Participant} ${driving ? styles.ParticipantDriver : ""}`}>
                    <span>{driving ? "⌨️" : "👤"} {p.name}{p.id === myId ? " (ты)" : ""}</span>
                    {driving && <span className={styles.DriverTag}>пишет</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.SideSection}>
            {isDriver ? (
              <Button size="sm" variant="primary" block onClick={room.run} disabled={room.state.running}>
                {room.state.running ? "Запуск…" : "▶ Запустить тесты"}
              </Button>
            ) : (
              <Button size="sm" block onClick={room.takeWheel} title="Перехватить управление — тот, кто за клавиатурой, пишет код">
                ⌨️ Взять клавиатуру
              </Button>
            )}
          </div>

          <div className={`${styles.SideSection} ${styles.ChatSection}`}>
            <Typography tag="span" size={12} color="text-muted">Чат</Typography>
            <div className={styles.Chat}>
              {room.chat.map((m, i) => (
                <div key={i} className={styles.ChatMsg}>
                  <span className={styles.ChatFrom}>{m.from}:</span> {m.text}
                </div>
              ))}
              {room.chat.length === 0 && (
                <div className={styles.ChatEmpty}>Сообщений пока нет</div>
              )}
            </div>
            <input
              className={styles.ChatInput}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Сообщение…"
              maxLength={500}
            />
          </div>
        </aside>

        <main className={styles.Main}>
          <div className={styles.Condition}>
            <div className={styles.ConditionInner}>
              <ConditionPanel condition={room.task.condition} hints={[]} />
            </div>
          </div>
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={room.task.language === "javascript" ? "javascript" : "typescript"}
            readOnly={!isDriver}
          />
          <TestResults
            result={room.state.lastRun}
            loading={room.state.running}
            height={200}
          />
        </main>
      </div>

      {!isDriver && (
        <div className={styles.ViewModeBar}>
          👀 Ты наблюдаешь{driver ? `: за клавиатурой ${driver.name}` : ""}. Нажми «Взять клавиатуру», чтобы писать код.
        </div>
      )}

      <TaskPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          setPickerOpen(false);
          room.pickTask(id);
        }}
        excludeId={room.task.id}
      />
    </div>
  );
}
