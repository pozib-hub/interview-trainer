import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Box, Button, EmptyState, Skeleton, Typography } from "@ui/index";
import type { QuestionsIndex } from "@lib/types";
import { fetchQuestionsIndex, technologyQuestionCount } from "@lib/questionsApi";
import QuestionProposalModal from "@components/QuestionProposalModal";
import QuestionsBrowser from "./components/QuestionsBrowser";
import styles from "./questions.module.css";

export default function TechnologyPage() {
  const { direction: directionId = "", technology: technologyId = "" } = useParams();
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [searchParams] = useSearchParams();
  const focusChapterId = searchParams.get("ch") || undefined;

  const [proposalOpen, setProposalOpen] = useState(false);

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
        </div>
      </div>

      <QuestionsBrowser
        chapters={technology.chapters}
        focusChapterId={focusChapterId}
        searchPlaceholder={`Поиск по вопросам: ${technology.title}…`}
      />

      <div className={styles.AddQuestionNote}>
        Хотите поделиться вопросом со всеми?{" "}
        <Button
          size="sm"
          onClick={() => setProposalOpen(true)}
          title="ИИ оформит вопрос с ответом и откроет pull request в общий сборник"
        >
          ➕ Предложить в общий сборник
        </Button>
      </div>

      <QuestionProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        index={index}
        initial={{ category: `${directionId}/${technologyId}` }}
      />
    </div>
  );
}
