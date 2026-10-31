import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { QuestionChapter, QuestionsIndex, UserQuestion } from "@lib/types";
import { fetchQuestionsIndex, buildCategoryOptions, categoryLabel } from "@lib/questionsApi";
import { useUserQuestions } from "@hooks/useUserQuestions";
import QuestionProposalModal from "@components/QuestionProposalModal";
import SearchBox from "./components/SearchBox";
import ChapterList from "./components/ChapterList";
import QuestionForm from "./components/QuestionForm";
import { filterChapters, normalizeQuery } from "./components/QuestionsBrowser";
import styles from "./questions.module.css";

type Editor = { mode: "new" } | { mode: "edit"; question: UserQuestion } | null;

export default function MyQuestionsPage() {
  const [searchParams] = useSearchParams();
  const focusQuestionId = searchParams.get("focus") || undefined;

  const { questions: userQuestions, loaded, addQuestion, updateQuestion, removeQuestion } =
    useUserQuestions();
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<Editor>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalInitial, setProposalInitial] = useState<{ question?: string; userAnswer?: string; category?: string } | null>(null);

  useEffect(() => {
    fetchQuestionsIndex().then(setIndex).catch(() => setIndex({ directions: [] }));
  }, []);

  const categoryOptions = useMemo(
    () => (index ? buildCategoryOptions(index) : []),
    [index]
  );

  const groups = useMemo<QuestionChapter[]>(() => {
    const byCat = new Map<string, UserQuestion[]>();
    for (const q of userQuestions) {
      const key = q.category || "";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(q);
    }

    const result: QuestionChapter[] = [];
    for (const opt of categoryOptions) {
      const items = byCat.get(opt.value);
      if (items?.length) {
        result.push({ id: `cat:${opt.value}`, title: opt.label, questions: items });
        byCat.delete(opt.value);
      }
    }
    for (const [key, items] of byCat) {
      result.push({
        id: `cat:${key || "none"}`,
        title: key && index ? categoryLabel(index, key) : "Без категории",
        questions: items,
      });
    }
    return result;
  }, [userQuestions, categoryOptions, index]);

  const searching = normalizeQuery(query).length >= 2;
  const filtered = useMemo(() => filterChapters(groups, query), [groups, query]);

  const handleSubmit = (draft: { question: string; answer: string; category?: string }) => {
    if (editor?.mode === "edit") updateQuestion(editor.question.id, draft);
    else addQuestion(draft);
    setEditor(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить вопрос?")) removeQuestion(id);
  };

  const itemActions = (qid: string) => (
    <>
      <button
        className={styles.IconBtn}
        title="Предложить в общий сборник — ИИ оформит и откроет PR"
        onClick={() => {
          const q = userQuestions.find((x) => x.id === qid);
          if (q) {
            setProposalInitial({ question: q.question, userAnswer: q.answer, category: q.category });
            setProposalOpen(true);
          }
        }}
      >
        ↗
      </button>
      <button
        className={styles.IconBtn}
        title="Изменить"
        onClick={() => {
          const q = userQuestions.find((x) => x.id === qid);
          if (q) setEditor({ mode: "edit", question: q });
        }}
      >
        ✏️
      </button>
      <button
        className={styles.IconBtn}
        title="Удалить"
        onClick={() => handleDelete(qid)}
      >
        🗑
      </button>
    </>
  );

  return (
    <div className={styles.Container}>
      <div className={styles.PageHead}>
        <div className={styles.Breadcrumb}>
          <Link to="/questions" className={styles.CrumbLink}>← Все направления</Link>
        </div>
        <h1 className={styles.PageTitle}>Мои вопросы</h1>
        <p className={styles.PageDesc}>
          Собственные вопросы с ответами. Хранятся в вашем аккаунте и
          доступны с любого устройства после входа.
        </p>
        <div className={styles.PageMeta}>{userQuestions.length} вопросов</div>
      </div>

      {editor ? (
        <QuestionForm
          categories={categoryOptions}
          initial={editor.mode === "edit" ? editor.question : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditor(null)}
        />
      ) : (
        <button
          className={styles.ToolbarButton}
          style={{ marginBottom: 16 }}
          onClick={() => setEditor({ mode: "new" })}
        >
          ➕ Добавить вопрос
        </button>
      )}

      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Поиск по моим вопросам…"
      />

      {!loaded || !index ? null : userQuestions.length === 0 && !searching ? (
        <p className={styles.ResultPath}>
          Пока нет своих вопросов. Нажмите «➕ Добавить вопрос», чтобы записать
          первый — например, тот, что вам задали на реальном собеседовании.
        </p>
      ) : (
        <ChapterList
          chapters={filtered}
          searching={searching}
          focusQuestionId={focusQuestionId}
          itemActions={itemActions}
        />
      )}

      <QuestionProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        index={index}
        initial={proposalInitial}
      />
    </div>
  );
}
