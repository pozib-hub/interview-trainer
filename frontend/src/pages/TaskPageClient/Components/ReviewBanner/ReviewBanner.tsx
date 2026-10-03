import { Typography } from "@ui/index";
import { humanInterval, daysUntil, type ReviewState } from "@lib/review";
import styles from "./ReviewBanner.module.css";

interface IReviewBannerProps {
  due: boolean;
  justDone: boolean;
  review: ReviewState | undefined;
  onStartFresh: () => void;
}

export default function ReviewBanner({ due, justDone, review, onStartFresh }: IReviewBannerProps) {
  if (!due && !justDone) return null;

  if (justDone) {
    return (
      <div className={`${styles.Banner} ${styles.Done}`}>
        <Typography tag="span" size={13}>
          ✅ Повторение засчитано — отличный результат. Следующее{" "}
          {review ? humanInterval(daysUntil(review)) : "позже"}.
        </Typography>
      </div>
    );
  }

  return (
    <div className={styles.Banner}>
      <Typography tag="span" size={13}>
        🔁 <strong>Задача на повторении</strong>
        {review && review.reps > 0 && ` (${review.reps}-е подряд)`} — реши её с чистого
        листа, чтобы закрепить материал.
      </Typography>
      <button type="button" className={styles.StartBtn} onClick={onStartFresh}>
        Начать с шаблона
      </button>
    </div>
  );
}
