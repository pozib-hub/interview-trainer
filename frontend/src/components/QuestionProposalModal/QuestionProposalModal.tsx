import { useEffect, useState } from "react";
import { Button, Spinner, Typography } from "@ui/index";
import { proposeQuestion, type QuestionProposalResult } from "@lib/questionsApi";
import type { QuestionsIndex } from "@lib/types";
import styles from "./QuestionProposalModal.module.css";

type Phase = "form" | "loading" | "result" | "error";

interface IQuestionProposalModalProps {
  open: boolean;
  onClose: () => void;
  index: QuestionsIndex | null;
  initial?: { question?: string; userAnswer?: string; category?: string } | null;
}

const LOADING_STEPS = [
  "ИИ изучает структуру сборника…",
  "Выбирает направление, технологию и главу…",
  "Оформляет вопрос и ответ…",
  "Создаёт pull request…",
];

export default function QuestionProposalModal({ open, onClose, index, initial }: IQuestionProposalModalProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [direction, setDirection] = useState("");
  const [technology, setTechnology] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<QuestionProposalResult | null>(null);
  const [error, setError] = useState("");
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    setPhase("form");
    setResult(null);
    setError("");
    setStepIdx(0);
    setQuestion(initial?.question ?? "");
    setUserAnswer(initial?.userAnswer ?? "");
    setNotes("");
    if (initial?.category && index) {
      const [d, t] = initial.category.split("/");
      if (d && index.directions.some((x) => x.id === d)) {
        setDirection(d);
        if (t && index.directions.some((x) => x.id === d && x.technologies.some((y) => y.id === initial.category))) {
          setTechnology(t);
        } else {
          setTechnology("");
        }
      }
    } else {
      setDirection("");
      setTechnology("");
    }
  }, [open, initial, index]);

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

  const selectedDirection = index?.directions.find((d) => d.id === direction) ?? null;

  const canSubmit = question.trim().length > 0 && phase === "form";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase("loading");
    const res = await proposeQuestion({
      question: question.trim(),
      userAnswer: userAnswer.trim(),
      direction: direction || undefined,
      technology: technology || undefined,
      notes: notes.trim() || undefined,
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
    setQuestion("");
    setUserAnswer("");
    setNotes("");
    setResult(null);
    setPhase("form");
  };

  return (
    <div className={styles.Overlay} onMouseDown={(e) => e.target === e.currentTarget && phase !== "loading" && onClose()}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        {phase === "form" && (
          <form onSubmit={handleSubmit}>
            <Typography tag="h2" size={18} mb={4}>
              Предложить вопрос
            </Typography>
            <Typography tag="p" color="text-muted" size={12} mb={16}>
              ИИ оформит вопрос с ответом, подберёт главу и откроет черновик pull request в общий сборник.
            </Typography>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Вопрос *</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea}`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Что спросили на собеседовании?"
                rows={2}
                maxLength={2000}
                required
                autoFocus
              />
            </label>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Свой ответ (необязательно)</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea}`}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Если есть свой вариант — ИИ возьмёт его за основу и дополнит"
                rows={4}
                maxLength={20000}
              />
            </label>

            <div className={styles.RowWrap}>
              <div className={styles.Row}>
                <label className={styles.Label}>
                  <span className={styles.LabelText}>Направление</span>
                  <select
                    className={styles.Select}
                    value={direction}
                    onChange={(e) => {
                      setDirection(e.target.value);
                      setTechnology("");
                    }}
                  >
                    <option value="">ИИ определит сам</option>
                    {(index?.directions ?? []).map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </label>

                <label className={styles.Label}>
                  <span className={styles.LabelText}>Технология</span>
                  <select
                    className={styles.Select}
                    value={technology}
                    onChange={(e) => setTechnology(e.target.value)}
                    disabled={!selectedDirection || selectedDirection.technologies.length === 0}
                  >
                    <option value="">
                      {!selectedDirection
                        ? "— выберите направление —"
                        : selectedDirection.technologies.length === 0
                          ? "нет технологий"
                          : "ИИ определит сам"}
                    </option>
                    {(selectedDirection?.technologies ?? []).map((t) => (
                      <option key={t.id} value={t.id.split("/")[1]}>{t.title}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <label className={styles.Label}>
              <span className={styles.LabelText}>Заметки (необязательно)</span>
              <textarea
                className={`${styles.Input} ${styles.Textarea}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Контекст для ИИ: нацеленность вопроса, стиль, что важно подчеркнуть…"
                rows={2}
                maxLength={5000}
              />
            </label>

            <div className={styles.Actions}>
              <Button type="button" size="sm" onClick={onClose}>Отмена</Button>
              <Button type="submit" size="sm" variant="primary" disabled={!canSubmit}>
                ✨ Оформить через ИИ → PR
              </Button>
            </div>
          </form>
        )}

        {phase === "loading" && (
          <div className={styles.Center}>
            <Typography tag="h2" size={18} mb={12}><Spinner mr={8} /> ИИ оформляет вопрос…</Typography>
            <Typography color="text-muted" size={13} mb={8}>
              Может занять до минуты. Не закрывайте окно.
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
            <Typography tag="h2" size={18} mb={8}>
              {result.dryRun ? "Черновик подготовлен" : "✅ Pull request создан"}
            </Typography>
            <div className={styles.ResultCard}>
              <Typography mb={8}>
                <strong>{result.question}</strong>
              </Typography>
              <Typography tag="p" size={12} color="text-muted" mb={12}>
                {result.direction}
                {result.technology && ` / ${result.technology}`} · глава: <code>{result.chapter}</code>
                {result.newChapter && <span className={styles.Badge}>новая</span>}
                {" "}· ветка: <code>{result.branch}</code>
              </Typography>
              <div className={styles.PreviewLabel}>Ответ</div>
              <Typography tag="p" size={13} className={styles.PreviewAnswer} mb={12}>
                {result.answer}
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
              <Button size="sm" onClick={handleReset}>Предложить ещё один</Button>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div>
            <Typography tag="h2" size={18} mb={12}>❌ Не удалось оформить вопрос</Typography>
            <div className={`${styles.ResultCard} ${styles.ErrorCard}`}>
              <Typography tag="p" size={13} className={styles.Pre}>{error}</Typography>
            </div>
            <div className={styles.Actions}>
              <Button size="sm" onClick={() => setPhase("form")}>Исправить форму</Button>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
