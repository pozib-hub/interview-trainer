import { Typography } from "@ui/index";
import styles from "./HintPanel.module.css";

interface IHintPanelProps {
  hints: string[];
  loading: boolean;
  error: string;
}

export default function HintPanel({ hints, loading, error }: IHintPanelProps) {
  if (hints.length === 0 && !loading && !error) return null;

  return (
    <div className={styles.Panel}>
      {hints.map((h, i) => (
        <div key={i} className={styles.Item}>
          <Typography tag="span" size={11} color="accent" className={styles.Num}>
            🤖 Подсказка {i + 1}
          </Typography>
          <div className={styles.Text}>{h}</div>
        </div>
      ))}
      {loading && (
        <div className={styles.Item}>
          <Typography tag="span" size={11} color="text-muted">
            🤖 Думаю над подсказкой…
          </Typography>
        </div>
      )}
      {error && (
        <div className={`${styles.Item} ${styles.ErrorItem}`}>
          <Typography tag="span" size={11} color="red">
            Ошибка
          </Typography>
          <div className={styles.Text}>{error}</div>
        </div>
      )}
    </div>
  );
}
