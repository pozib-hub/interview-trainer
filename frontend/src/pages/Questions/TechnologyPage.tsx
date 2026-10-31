import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Box, Button, EmptyState, Skeleton, Typography } from "@ui/index";
import type { QuestionsIndex, UserQuestion } from "@lib/types";
import { fetchQuestionsIndex, technologyQuestionCount, buildCategoryOptions } from "@lib/questionsApi";
import { useUserQuestions } from "@hooks/useUserQuestions";
import QuestionProposalModal from "@components/QuestionProposalModal";
import QuestionsBrowser from "./components/QuestionsBrowser";
import QuestionForm from "./components/QuestionForm";
import QuestionItem from "./components/QuestionItem";
import styles from "./questions.module.css";

type Editor = { mode: "new" } | { mode: "edit"; question: UserQuestion } | null;

export default function TechnologyPage() {
  const { direction: directionId = "", technology: technologyId = "" } = useParams();
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [searchParams] = useSearchParams();
  const focusChapterId = searchParams.get("ch") || undefined;

  const { questions: userQuestions, addQuestion, updateQuestion, removeQuestion } =
    useUserQuestions();

  useEffect(() => {
    fetchQuestionsIndex().then(setIndex).catch(() => setIndex({ directions: [] }));
  }, []);

  const direction = useMemo(
    () => index?.directions.find((d) => d.id === directionId) ?? null,
    [index, directionId]
  );
  const technology = useMemo(
    () => direction?.technologies.find((t) => t.id === `${directionId}/${technologyId}`) ?? null,
    [direction, directionId, technologyId]
  );

  const categoryOptions = useMemo(
    () => (index ? buildCategoryOptions(index) : []),
    [index]
  );
  const myForTech = useMemo(
    () => userQuestions.filter((q) => q.category === `${directionId}/${technologyId}`),
    [userQuestions, directionId, technologyId]
  );

  const [editor, setEditor] = useState<Editor>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalInitial, setProposalInitial] = useState<{ question?: string; userAnswer?: string; category?: string } | null>(null);

  const shareToCollection = (q: UserQuestion) => {
    setProposalInitial({ question: q.question, userAnswer: q.answer, category: q.category });
    setProposalOpen(true);
  };

  const toggleMy = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (draft: { question: string; answer: string; category?: string }) => {
    if (editor?.mode === "edit") updateQuestion(editor.question.id, draft);
    else addQuestion({ ...draft, category: draft.category ?? `${directionId}/${technologyId}` });
    setEditor(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить вопрос?")) removeQuestion(id);
  };

  if (!index) {
    return (
      <div className={styles.Container}>
        <Box p="24px 0">
          <Skeleton line width="30%" />
          <Skeleton line width="80%" />
          <Skeleton line width="60%" />
        </Box>
      </div>
    );
  }

  if (!technology) {
    return (
      <div className={styles.Container}>
        <EmptyState>
          <Typography align="center">
            Технология «{directionId}/{technologyId}» не найдена.
          </Typography>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.PageHead}>
        <div className={styles.Breadcrumb}>
          <Link to="/questions" className={styles.CrumbLink}>Вопросы</Link>
          <span>/</span>
          <Link to={`/questions/${directionId}`} className={styles.CrumbLink}>
            {direction?.title ?? directionId}
          </Link>
        </div>
        <h1 className={styles.PageTitle}>{technology.title}</h1>
        <p className={styles.PageDesc}>{technology.description}</p>
        <div className={styles.PageMeta}>
          {technology.chapters.length} глав · {technologyQuestionCount(technology)} вопросов
          {myForTech.length > 0 && ` · своих: ${myForTech.length}`}
        </div>
      </div>

      <QuestionsBrowser
        chapters={technology.chapters}
        focusChapterId={focusChapterId}
        searchPlaceholder={`Поиск по вопросам: ${technology.title}…`}
      />

      <section className={styles.MyQuestionsSection}>
        <div className={styles.ChapterHeader}>
          <h2 className={styles.ChapterTitle}>⭐ Мои вопросы</h2>
          <span className={styles.ChapterCount}>{myForTech.length}</span>
        </div>

        {editor ? (
          <QuestionForm
            categories={categoryOptions}
            initial={editor.mode === "edit" ? editor.question : null}
            defaultCategory={`${directionId}/${technologyId}`}
            onSubmit={handleSubmit}
            onCancel={() => setEditor(null)}
          />
        ) : (
          <button className={styles.ToolbarButton} onClick={() => setEditor({ mode: "new" })}>
            ➕ Добавить свой вопрос
          </button>
        )}

        {myForTech.map((q, i) => (
          <QuestionItem
            key={q.id}
            entry={q}
            index={i + 1}
            open={openIds.has(q.id)}
            onToggle={() => toggleMy(q.id)}
            actions={
              <>
                <button
                  className={styles.IconBtn}
                  title="Предложить в общий сборник — ИИ оформит и откроет PR"
                  onClick={() => shareToCollection(q)}
                >
                  ↗
                </button>
                <button
                  className={styles.IconBtn}
                  title="Изменить"
                  onClick={() => setEditor({ mode: "edit", question: q })}
                >
                  ✏️
                </button>
                <button
                  className={styles.IconBtn}
                  title="Удалить"
                  onClick={() => handleDelete(q.id)}
                >
                  🗑
                </button>
              </>
            }
          />
        ))}

        {myForTech.length === 0 && !editor && (
          <p className={styles.ResultPath}>
            Своих вопросов по этой технологии пока нет.
          </p>
        )}
      </section>

      <div className={styles.AddQuestionNote}>
        Хотите поделиться вопросом со всеми?{" "}
        <Button
          size="sm"
          onClick={() => {
            setProposalInitial({ category: `${directionId}/${technologyId}` });
            setProposalOpen(true);
          }}
          title="ИИ оформит вопрос с ответом и откроет pull request в общий сборник"
        >
          ➕ Предложить в общий сборник
        </Button>
      </div>

      <QuestionProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        index={index}
        initial={proposalInitial}
      />
    </div>
  );
}
