import { useEffect, useState } from "react";
import type { PlanQuestion } from "@lib/types";
import { useSpeechRecognition } from "@hooks/useSpeechRecognition";
import { Spinner } from "@ui/index";
import styles from "../interview.module.css";
import qStyles from "../../questions.module.css";

interface ISessionPhaseProps {
  questions: PlanQuestion[];
  current: number;
  answers: Record<string, string>;
  onAnswer: (qid: string, text: string) => void;
  onGoTo: (index: number) => void;
  onNext: () => void;
  onFinishEarly: () => void;
  startedAt: number;
  analyzing: boolean;
  error: string;
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SessionPhase(props: ISessionPhaseProps) {
  const { questions, current, answers, onAnswer, onGoTo, onNext, onFinishEarly, startedAt, analyzing, error } = props;

  const q = questions[current];
  const value = answers[q.id] ?? "";

  const handleFinalChunk = (text: string) => {
    onAnswer(q.id, (value ? value + " " : "") + text);
  };
  const { supported, listening, interim, micError, start, stop } =
    useSpeechRecognition(handleFinalChunk);

  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);
  useEffect(() => {
    if (analyzing) return;
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt, analyzing]);

  const isLast = current === questions.length - 1;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className={qStyles.Container} style={{ position: "relative" }}>
      <div className={styles.SessionHead}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Вопрос {current + 1} из {questions.length}
        </span>
        <span className={styles.Timer}>⏱ {formatElapsed(elapsed)}</span>
      </div>
      <div className={styles.Progress}>
        <div className={styles.ProgressFill} style={{ width: `${progress}%` }} />
      </div>

      {error && <div className={`${styles.Banner} ${styles.BannerError}`}>⚠️ {error}</div>}

      <div className={styles.QuestionCard}>
        <div className={styles.QuestionMeta}>
          {q.techTitle} · {q.chapterTitle}
        </div>
        <h2 className={styles.QuestionText}>{q.question}</h2>
      </div>

      <div className={styles.MicRow}>
        {supported ? (
          <button
            className={`${styles.MicBtn} ${listening ? styles.MicBtnActive : ""}`}
            onClick={() => (listening ? stop() : start())}
          >
            {listening ? (
              <>
                <span className={styles.ListeningDot} /> Остановить запись
              </>
            ) : (
              <>🎤 Ответить голосом</>
            )}
          </button>
        ) : (
          <span className={qStyles.ResultPath}>
            Браузер не поддерживает распознавание речи — ответьте текстом
            (лучше всего работает в Chrome/Edge).
          </span>
        )}
      </div>

      {micError && <p className={qStyles.ResultPath}>{micError}</p>}
      {listening && interim && <p className={styles.Interim}>{interim}…</p>}

      <label className={styles.AnswerLabel}>Ваш ответ (расшифровка, можно править):</label>
      <textarea
        className={qStyles.Textarea}
        rows={8}
        value={value}
        onChange={(e) => onAnswer(q.id, e.target.value)}
        placeholder="Нажмите «Ответить голосом» или напишите ответ здесь…"
        spellCheck={false}
        disabled={analyzing}
      />

      <div className={styles.SessionNav}>
        <button
          className={qStyles.ToolbarButton}
          onClick={() => onGoTo(current - 1)}
          disabled={current === 0}
          style={current === 0 ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
        >
          ← Предыдущий
        </button>
        <button className={styles.MicBtn} onClick={onNext} disabled={analyzing}>
          {isLast ? "Завершить и отправить на разбор ✓" : "Далее →"}
        </button>
        <span style={{ flex: 1 }} />
        <button className={styles.FinishLink} onClick={onFinishEarly} disabled={analyzing}>
          завершить досрочно
        </button>
      </div>

      {analyzing && (
        <div className={styles.Overlay}>
          <Spinner />
          <div className={styles.OverlayText}>ИИ разбирает ваши ответы…</div>
          <div className={styles.OverlayHint}>
            Обычно занимает до минуты. Не закрывайте страницу.
          </div>
        </div>
      )}
    </div>
  );
}
