import { useEffect } from "react";
import { Button, Spinner, Typography } from "@ui/index";
import type { TaskReview } from "@lib/types";
import styles from "./ReviewModal.module.css";

interface IReviewModalProps {
  open: boolean;
  loading: boolean;
  error: string;
  review: TaskReview | null;
  onClose: () => void;
}

const VERDICTS: Record<string, { label: string; cls: string }> = {
  "strong-hire": { label: "Strong Hire", cls: "Strong" },
  hire: { label: "Hire", cls: "Hire" },
  "lean-hire": { label: "Lean Hire", cls: "Lean" },
  "no-hire": { label: "No Hire", cls: "No" },
};

export default function ReviewModal({ open, loading, error, review, onClose }: IReviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const verdict = review ? VERDICTS[review.verdict] ?? { label: review.verdict, cls: "Hire" } : null;

  return (
    <div className={styles.Overlay} onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        {loading && (
          <div className={styles.Center}>
            <Typography tag="h2" size={18} mb={12}><Spinner mr={8} />ИИ-интервьюер разбирает код…</Typography>
            <Typography color="text-muted" size={13}>
              Это занимает до минуты: проверяются тесты, асимптотика, сравнение с эталоном.
            </Typography>
          </div>
        )}

        {!loading && error && (
          <div>
            <Typography tag="h2" size={18} mb={12}>❌ Не удалось получить ревью</Typography>
            <div className={`${styles.Card} ${styles.ErrorCard}`}>
              <Typography tag="p" size={13}>{error}</Typography>
            </div>
            <div className={styles.Actions}>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}

        {!loading && !error && review && verdict && (
          <div>
            <Typography tag="h2" size={18} mb={4}>🤖 ИИ-ревью кода</Typography>
            <Typography tag="p" color="text-muted" size={12} mb={12}>
              Разбор как на реальном собеседовании
            </Typography>

            <div className={`${styles.Verdict} ${styles[verdict.cls]}`}>
              <span className={styles.VerdictLabel}>Вердикт</span>
              <span className={styles.VerdictValue}>{verdict.label}</span>
              {review.complexity && (
                <span className={styles.Complexity}>{review.complexity}</span>
              )}
            </div>

            <Typography mb={12}>{review.summary}</Typography>

            {review.strengths?.length > 0 && (
              <div className={styles.Section}>
                <Typography size={12} color="green" weight={600} mb={6}>✓ Сильные стороны</Typography>
                <ul className={styles.List}>
                  {review.strengths.map((s, i) => <li key={i} className={styles.ItemGreen}>{s}</li>)}
                </ul>
              </div>
            )}

            {review.improvements?.length > 0 && (
              <div className={styles.Section}>
                <Typography size={12} color="yellow" weight={600} mb={6}>▲ Что улучшить</Typography>
                <ul className={styles.List}>
                  {review.improvements.map((s, i) => <li key={i} className={styles.ItemYellow}>{s}</li>)}
                </ul>
              </div>
            )}

            {review.comparison && (
              <div className={styles.Section}>
                <Typography size={12} color="text-muted" weight={600} mb={6}>⚖ Сравнение с эталоном</Typography>
                <Typography tag="p" size={13}>{review.comparison}</Typography>
              </div>
            )}

            {review.questions?.length > 0 && (
              <div className={styles.Section}>
                <Typography size={12} color="accent" weight={600} mb={6}>? Спросили бы на собеседовании</Typography>
                <ul className={styles.List}>
                  {review.questions.map((s, i) => <li key={i} className={styles.ItemAccent}>{s}</li>)}
                </ul>
              </div>
            )}

            <div className={styles.Actions}>
              <Button size="sm" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
