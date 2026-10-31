
import { useEffect, useMemo, useRef, useState } from "react";
import type { QuestionChapter } from "@lib/types";
import QuestionItem from "./QuestionItem";
import styles from "../questions.module.css";

interface IChapterListProps {
  chapters: QuestionChapter[];
  /** id главы из ?ch= — раскрыть и проскроллить к ней при монтировании */
  focusChapterId?: string;
  /** id вопроса из ?focus= — раскрыть и проскроллить к нему */
  focusQuestionId?: string;
  /** Режим поиска: все найденные вопросы раскрыты */
  searching?: boolean;
  /** Кнопки действий для каждого вопроса (изменить/удалить) */
  itemActions?: (questionId: string) => React.ReactNode;
}

export default function ChapterList(props: IChapterListProps) {
  const { chapters, focusChapterId, focusQuestionId, searching = false, itemActions } = props;

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const chapterRefs = useRef<Map<string, HTMLElement>>(new Map());

  const allQuestionIds = useMemo(
    () => new Set(chapters.flatMap((c) => c.questions.map((q) => q.id))),
    [chapters]
  );
  const allOpen = useMemo(
    () => [...allQuestionIds].every((id) => openIds.has(id)) && allQuestionIds.size > 0,
    [openIds, allQuestionIds]
  );

  useEffect(() => {
    if (!focusChapterId) return;
    setOpenIds((prev) => {
      const next = new Set(prev);
      const chapter = chapters.find((c) => c.id === focusChapterId);
      if (chapter) for (const q of chapter.questions) next.add(q.id);
      return next;
    });
    const el = chapterRefs.current.get(focusChapterId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusChapterId]);

  useEffect(() => {
    if (!focusQuestionId) return;
    setOpenIds((prev) => new Set(prev).add(focusQuestionId));
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-question-id="${focusQuestionId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [focusQuestionId]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allOpen) setOpenIds(new Set());
    else setOpenIds(new Set(allQuestionIds));
  };

  const totalQuestions = allQuestionIds.size;

  return (
    <div>
      <div className={styles.Toolbar}>
        <span className={styles.ToolbarCount}>
          {chapters.length} глав · {totalQuestions} вопросов
        </span>
        <span style={{ flex: 1 }} />
        <button className={styles.ToolbarButton} onClick={toggleAll}>
          {allOpen ? "Свернуть все ▴" : "Развернуть все ▾"}
        </button>
      </div>
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          className={styles.Chapter}
          ref={(el) => {
            if (el) chapterRefs.current.set(chapter.id, el);
          }}
        >
          <div className={styles.ChapterHeader}>
            <h2 className={styles.ChapterTitle}>{chapter.title}</h2>
            <span className={styles.ChapterCount}>{chapter.questions.length}</span>
          </div>
          {chapter.questions.map((entry, i) => (
            <QuestionItem
              key={entry.id}
              entry={entry}
              index={i + 1}
              open={searching ? true : openIds.has(entry.id)}
              onToggle={() => toggle(entry.id)}
              actions={itemActions?.(entry.id)}
            />
          ))}
        </section>
      ))}
      {chapters.length === 0 && (
        <p className={styles.ResultPath}>Ничего не найдено.</p>
      )}
    </div>
  );
}
