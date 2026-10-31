
import { useState } from "react";
import type { UserQuestion } from "@lib/types";
import type { QuestionCategoryOption } from "@lib/questionsApi";
import { Button } from "@ui/index";
import styles from "../questions.module.css";

interface IQuestionFormProps {
  categories: QuestionCategoryOption[];
  /** Редактируемый вопрос (null — создание нового) */
  initial?: UserQuestion | null;
  defaultCategory?: string;
  onSubmit: (draft: { question: string; answer: string; category?: string }) => void;
  onCancel?: () => void;
}

export default function QuestionForm(props: IQuestionFormProps) {
  const { categories, initial, defaultCategory, onSubmit, onCancel } = props;

  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? defaultCategory ?? "");

  const submit = () => {
    if (!question.trim()) return;
    onSubmit({ question, answer, category });
  };

  return (
    <div className={styles.Form}>
      <label className={styles.Label}>
        Вопрос *
        <textarea
          className={styles.Textarea}
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Что спросили на собеседовании?"
          spellCheck={false}
        />
      </label>
      <label className={styles.Label}>
        Ответ
        <textarea
          className={styles.Textarea}
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={"Можно markdown: **жирный**, `код`, ```блоки```"}
          spellCheck={false}
        />
      </label>
      <label className={styles.Label}>
        Категория
        <select
          className={styles.Select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.FormActions}>
        <Button
          size="sm"
          variant="primary"
          disabled={!question.trim()}
          onClick={submit}
        >
          {initial ? "Сохранить" : "Добавить"}
        </Button>
        {onCancel && (
          <Button size="sm" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </div>
  );
}
