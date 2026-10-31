import { useState } from "react";
import { Link } from "react-router-dom";
import { renderMarkdown } from "@shared/lib/renderMarkdown";
import type { ResultItem } from "../../QuestionInterviewPage";
import styles from "../interview.module.css";
import qStyles from "../../questions.module.css";

interface IResultsPhaseProps {
  items: ResultItem[];
  summary: string;
  totalQuestions: number;
  onRestart: () => void;
}

export default function ResultsPhase(props: IResultsPhaseProps) {
  const { items, summary, totalQuestions, onRestart } = props;

  const [openId, setOpenId] = useState<string | null>(null);

  const okCount = items.filter((it) => it.ok).length;
  const skipped = Math.max(0, totalQuestions - items.length);

  return (
    <div className={qStyles.Container}>
      <div className={qStyles.PageHead}>
        <div className={qStyles.Breadcrumb}>
          <Link to="/questions" className={qStyles.CrumbLink}>← Вопросы</Link>
        </div>
        <h1 className={qStyles.PageTitle}>Разбор ответов</h1>
        <p className={styles.ScoreLine}>
          {okCount === items.length ? "🏆" : okCount / items.length >= 0.6 ? "👏" : "📚"}{" "}
          ✅ {okCount} из {items.length}
        </p>
        {skipped > 0 && (
          <p className={styles.SkippedNote}>
            Ещё {skipped} вопрос(ов) остались без ответа и не оценивались.
          </p>
        )}
      </div>

      {summary && (
        <div className={styles.SummaryCard}>
          <strong>Итог от ИИ:</strong> {summary}
        </div>
      )}

      {items.map((item, i) => (
        <div key={item.question.id} className={styles.VerdictItem}>
          <button
            className={qStyles.QuestionButton}
            style={{ padding: "14px 16px" }}
            onClick={() => setOpenId(openId === item.question.id ? null : item.question.id)}
          >
            <span className={qStyles.QuestionIndex}>{i + 1}</span>
            <span className={styles.VerdictQuestion}>
              {item.ok ? "✅" : "❌"} {item.question.question}
            </span>
            <span
              className={`${qStyles.QuestionChevron} ${openId === item.question.id ? qStyles.QuestionChevronOpen : ""}`}
            >
              ▶
            </span>
          </button>
          {openId === item.question.id && (
            <div className={styles.VerdictBody}>
              <div className={styles.VerdictLabel}>Ваш ответ</div>
              <p className={styles.UserAnswer}>{item.userAnswer}</p>
              <div className={styles.VerdictLabel}>Разбор ИИ</div>
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.feedback || "—") }}
              />
            </div>
          )}
        </div>
      ))}

      <div className={styles.SessionNav} style={{ marginTop: 24 }}>
        <button className={styles.MicBtn} onClick={onRestart}>
          🎤 Пройти ещё раз
        </button>
        <Link
          className={qStyles.ToolbarButton}
          to="/questions"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          ← К списку вопросов
        </Link>
      </div>
    </div>
  );
}
