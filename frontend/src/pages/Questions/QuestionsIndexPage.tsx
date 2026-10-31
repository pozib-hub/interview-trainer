import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, EmptyState, Skeleton, Typography } from "@ui/index";
import type { QuestionsIndex } from "@lib/types";
import { fetchQuestionsIndex, directionQuestionCount } from "@lib/questionsApi";
import { normalizeQuery } from "./components/QuestionsBrowser";
import SearchBox from "./components/SearchBox";
import styles from "./questions.module.css";

interface SearchResultItem {
  question: string;
  href: string;
  path: string[];
}

const MAX_RESULTS = 50;

function searchAll(index: QuestionsIndex, query: string): SearchResultItem[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  const results: SearchResultItem[] = [];
  outer: for (const direction of index.directions) {
    const groups: { title: string; hrefBase: string; chapters: QuestionsIndex["directions"][number]["chapters"] }[] = [];

    for (const tech of direction.technologies) {
      groups.push({ title: tech.title, hrefBase: `/questions/${tech.id}`, chapters: tech.chapters });
    }
    if (direction.chapters.length > 0) {
      groups.push({ title: direction.title, hrefBase: `/questions/${direction.id}`, chapters: direction.chapters });
    }

    for (const group of groups) {
      for (const chapter of group.chapters) {
        const chapterMatches = normalizeQuery(chapter.title).includes(q);
        for (const entry of chapter.questions) {
          const matches =
            chapterMatches ||
            normalizeQuery(entry.question).includes(q) ||
            normalizeQuery(entry.answer).includes(q);
          if (matches) {
            results.push({
              question: entry.question,
              href: `${group.hrefBase}?ch=${chapter.id}`,
              path: [direction.title, group.title, chapter.title],
            });
          }
          if (results.length >= MAX_RESULTS) break outer;
        }
      }
    }
  }

  return results;
}

export default function QuestionsIndexPage() {
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchQuestionsIndex().then(setIndex).catch(() => setIndex({ directions: [] }));
  }, []);

  const results = useMemo(
    () => (index ? searchAll(index, query) : []),
    [index, query]
  );
  const searching = normalizeQuery(query).length >= 2;

  return (
    <div className={styles.Container}>
      <div className={styles.PageHead}>
        <h1 className={styles.PageTitle}>Вопросы с собеседований</h1>
        <p className={styles.PageDesc}>
          Сборник вопросов по направлениям и технологиям. Выберите направление
          или найдите вопрос поиском.
        </p>
      </div>

      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Поиск по всем вопросам и ответам…"
      />

      {!index && (
        <Box p="24px 0">
          <Skeleton line width="40%" />
          <Skeleton line width="90%" />
          <Skeleton line width="70%" />
          <Skeleton line width="80%" />
        </Box>
      )}

      {index && searching && (
        results.length > 0 ? (
          <div>
            <Typography color="text-muted" size={12} mb={10}>
              Найдено: {results.length}
              {results.length >= MAX_RESULTS && "+"}
            </Typography>
            {results.map((r, i) => (
              <Link key={i} to={r.href} className={styles.ResultItem}>
                <div className={styles.ResultQuestion}>{r.question}</div>
                <div className={styles.ResultPath}>{r.path.join(" · ")}</div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState>
            <Typography align="center">Ничего не найдено.</Typography>
            <Typography align="center" color="text-muted" size={12} mt={6}>
              Попробуйте другой запрос или предложите свой вопрос
              в общий сборник.
            </Typography>
          </EmptyState>
        )
      )}

      {index && !searching && (
        <>
          <Link to="/questions/interview" className={styles.InterviewBanner}>
            <div>
              <h3 className={styles.InterviewBannerTitle}>🎤 Пройти устное собеседование</h3>
              <p className={styles.InterviewBannerDesc}>
                ИИ подберёт вопросы на 30 минут — отвечайте голосом, в конце
                получите разбор каждого ответа
              </p>
            </div>
            <span className={styles.InterviewBannerArrow}>→</span>
          </Link>
          <div className={styles.Grid}>
            {index.directions.map((direction) => (
              <Link
                key={direction.id}
                to={`/questions/${direction.id}`}
                className={styles.Card}
              >
                <h3 className={styles.CardTitle}>{direction.title}</h3>
                <p className={styles.CardDesc}>{direction.description}</p>
                <div className={styles.CardMeta}>
                  {direction.technologies.length > 0
                    ? `${direction.technologies.length} технологий · `
                    : ""}
                  {directionQuestionCount(direction)} вопросов
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
