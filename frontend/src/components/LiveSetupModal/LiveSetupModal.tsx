import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spinner, Typography } from "@ui/index";
import { fetchTopics } from "@lib/taskApi";
import type { TaskSummary } from "@lib/types";
import styles from "./LiveSetupModal.module.css";

interface ILiveSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LiveSetupModal({ open, onClose }: ILiveSetupModalProps) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setError("");
    fetchTopics().then((data) => setTasks(Object.values(data).flat()));
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? tasks.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)))
      : tasks;
    return list.slice(0, 40);
  }, [tasks, query]);

  if (!open) return null;

  const createRoom = async (taskId: string) => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/live/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Ошибка ${res.status}`);
        return;
      }
      navigate(`/live/${data.roomId}`);
    } catch {
      setError("Не удалось создать комнату");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.Overlay} onMouseDown={(e) => e.target === e.currentTarget && !creating && onClose()}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        <Typography tag="h2" size={18} mb={4}>🎙 Лайвкодинг</Typography>
        <Typography tag="p" color="text-muted" size={12} mb={16}>
          Выбери задачу — получишь ссылку-приглашение. Один пишет, остальные видят код вживую;
          клавиатуру можно передавать. Идеально для мок-собеседования.
        </Typography>

        <input
          className={styles.Input}
          placeholder="Поиск задачи…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className={styles.List}>
          {filtered.map((t) => (
            <button key={t.id} type="button" className={styles.TaskRow} onClick={() => createRoom(t.id)} disabled={creating}>
              <span className={styles.TaskTitle}>{t.title}</span>
              <span className={styles.TaskTopic}>{t.topic}</span>
            </button>
          ))}
          {tasks.length === 0 && (
            <div className={styles.Empty}><Spinner mr={8} />Загрузка задач…</div>
          )}
          {tasks.length > 0 && filtered.length === 0 && (
            <div className={styles.Empty}>Ничего не найдено</div>
          )}
        </div>

        {error && (
          <Typography tag="p" color="red" size={12} mb={8}>{error}</Typography>
        )}

        <div className={styles.Actions}>
          <Button size="sm" onClick={onClose} disabled={creating}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}
