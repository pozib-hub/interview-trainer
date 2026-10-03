import { useEffect, useMemo, useState } from "react";
import { Button, Spinner, Typography } from "@ui/index";
import { fetchTopics } from "@lib/taskApi";
import type { TaskSummary } from "@lib/types";
import styles from "./TaskPickerModal.module.css";

interface ITaskPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (taskId: string) => void;
  excludeId?: string;
}

export default function TaskPickerModal({ open, onClose, onPick, excludeId }: ITaskPickerModalProps) {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
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
    return list.filter((t) => t.id !== excludeId).slice(0, 40);
  }, [tasks, query, excludeId]);

  if (!open) return null;

  return (
    <div className={styles.Overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        <Typography tag="h2" size={18} mb={4}>Выбрать задачу</Typography>
        <Typography tag="p" color="text-muted" size={12} mb={16}>
          Задача появится у всех участников комнаты; код начнётся с шаблона.
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
            <button key={t.id} type="button" className={styles.TaskRow} onClick={() => onPick(t.id)}>
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

        <div className={styles.Actions}>
          <Button size="sm" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}
