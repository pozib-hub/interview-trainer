import { useEffect, useState } from "react";
import { Button, Spinner, Typography } from "@ui/index";
import { proposeTask } from "@lib/taskApi";
import type { TaskProposalResult } from "@lib/types";
import styles from "./TaskProposalModal.module.css";

type Phase = "form" | "loading" | "result" | "error";

interface ITaskProposalModalProps {
  open: boolean;
  onClose: () => void;
}

const LOADING_STEPS = [
  "Анализирую описание задачи…",
  "Генерирую условие, тесты и решение через ИИ…",
  "Проверяю решение на тестах (vitest)…",
  "Создаю pull request…",
];

export default function TaskProposalModal({ open, onClose }: ITaskProposalModalProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [userSolution, setUserSolution] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<TaskProposalResult | null>(null);
  const [error, setError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPhase("form");
    setResult(null);
    setError("");
    setStepIdx(0);
  }, [open]);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setInterval(() => setStepIdx((i) => Math.min(i + 1, LOADING_STEPS.length - 1)), 7000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "loading") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  if (!open) return null;

  const canSubmit = description.trim().length > 0 && phase === "form";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase("loading");
    const res = await proposeTask({
      title: title.trim(),
      sourceUrl: sourceUrl.trim(),
      description: description.trim(),
      userSolution: userSolution.trim(),
      notes: notes.trim(),
    });
    if (res.ok) {
      setResult(res.data);
      setPhase("result");
    } else {
      setError(res.error);
      setPhase("error");
    }
  };

  const handleReset = () => {
    setTitle("");
    setSourceUrl("");
    setDescription("");
    setUserSolution("");
    setNotes("");
    setPhase("form");
  };

  return (
    <div className={styles.Overlay} onMouseDown={(e) => e.target === e.currentTarget && phase !== "loading" && onClose()}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        {phase === "form" && (
          <form onSubmit={handleSubmit}>
            <Typography tag="h2" size={18} mb={4}>
              Предложить новую задачу
            </Typography>
            <Typography tag="p" color="text-muted" size={12} mb={16}>
              Опишите задачу — ИИ сгенерирует условие, тесты и решение и откроет pull request в репозиторий.
            </Typography>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Заголовок (необязательно)</span>
              <input
                className={styles.Input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Найти пересечение двух массивов"
                maxLength={200}
              />
            </label>

            <label className={styles.Label}>
              <span className={styles.LabelText}>URL источника (необязательно)</span>
              <input
                className={styles.Input}
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/two-sum/"
                maxLength={2000}
              />
            </label>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Описание задачи *</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Что дано, что нужно вернуть, крайние случаи. Можно вставить текст задачи с LeetCode или из собеседования."
                rows={7}
                maxLength={20000}
                required
              />
            </label>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Ваше решение (необязательно)</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea} ${styles.Code}`}
                value={userSolution}
                onChange={(e) => setUserSolution(e.target.value)}
                placeholder="Если есть рабочий вариант решения — вставьте, ИИ оформит и проверит его"
                rows={4}
                maxLength={50000}
                spellCheck={false}
              />
            </label>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Дополнительные заметки (необязательно)</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Требования к асимптотике, желаемая тема, контекст…"
                rows={2}
                maxLength={5000}
              />
            </label>

            <div className={styles.Actions}>
              <Button type="button" size="sm" onClick={onClose}>Отмена</Button>
              <Button type="submit" size="sm" variant="primary" disabled={!canSubmit}>
                ✨ Сгенерировать задачу
              </Button>
            </div>
          </form>
        )}

        {phase === "loading" && (
          <div className={styles.Center}>
            <Typography tag="h2" size={18} mb={12}><Spinner mr={8} /> Генерация задачи…</Typography>
            <Typography color="text-muted" size={13} mb={8}>
              Это занимает до минуты — ИИ пишет условие, тесты и решение, затем оно проверяется на тестах.
            </Typography>
            <div className={styles.Steps}>
              {LOADING_STEPS.map((s, i) => (
                <div key={s} className={`${styles.Step} ${i < stepIdx ? styles.StepDone : ""} ${i === stepIdx ? styles.StepActive : ""}`}>
                  {i < stepIdx ? "✓" : i === stepIdx ? "▸" : "·"} {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div>
            <Typography tag="h2" size={18} mb={8}>✅ Задача сгенерирована</Typography>
            <div className={styles.ResultCard}>
              <Typography mb={8}>
                <strong>{result.title}</strong>
              </Typography>
              <Typography tag="p" size={12} color="text-muted" mb={12}>
                ID: <code>{result.taskId}</code> · ветка: <code>{result.branch}</code>
              </Typography>
              <Typography tag="p" size={13} mb={12}>
                Самопроверка (vitest): {result.selfCheck.passed
                  ? <span className={styles.Ok}>пройдена, {result.selfCheck.total} тестов</span>
                  : <span className={styles.Bad}>не пройдена — задача попадёт в PR с пометкой</span>}
              </Typography>
              {result.dryRun ? (
                <Typography tag="p" size={12} color="text-muted">
                  Dry-run режим: pull request не создавался (включён PROPOSAL_DRY_RUN).
                </Typography>
              ) : (
                <Button size="sm" variant="primary" href={result.prUrl} external>
                  Открыть pull request ↗
                </Button>
              )}
            </div>
            <div className={styles.Actions}>
              <Button size="sm" onClick={handleReset}>Предложить ещё одну</Button>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div>
            <Typography tag="h2" size={18} mb={12}>❌ Не удалось сгенерировать задачу</Typography>
            <div className={`${styles.ResultCard} ${styles.ErrorCard}`}>
              <Typography tag="p" size={13} className={styles.Pre}>{error}</Typography>
            </div>
            <div className={styles.Actions}>
              <Button size="sm" onClick={() => setPhase("form")}>Исправить описание</Button>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
