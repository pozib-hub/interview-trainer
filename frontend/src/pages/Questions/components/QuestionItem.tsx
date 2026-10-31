
import type { QuestionEntry } from "@lib/types";
import { renderMarkdown } from "@shared/lib/renderMarkdown";
import styles from "../questions.module.css";

interface IQuestionItemProps {
  entry: QuestionEntry;
  index: number;
  open: boolean;
  onToggle: () => void;
  /** Дополнительные действия справа от вопроса (кнопки изменения/удаления) */
  actions?: React.ReactNode;
}

export default function QuestionItem(props: IQuestionItemProps) {
  const { entry, index, open, onToggle, actions } = props;

  return (
    <div className={styles.Question} data-question-id={entry.id}>
      <div className={styles.QuestionRow}>
        <button className={styles.QuestionButton} onClick={onToggle}>
          <span className={styles.QuestionIndex}>{index}</span>
          <span>{entry.question}</span>
          <span
            className={`${styles.QuestionChevron} ${open ? styles.QuestionChevronOpen : ""}`}
          >
            ▶
          </span>
        </button>
        {actions && <div className={styles.QuestionActions}>{actions}</div>}
      </div>
      {open &&
        (entry.answer ? (
          <div
            className={styles.Answer}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.answer) }}
          />
        ) : (
          <div className={styles.Answer}>
            <span className={styles.ResultPath}>Ответ не добавлен.</span>
          </div>
        ))}
    </div>
  );
}
