
import { useMemo, useState } from "react";
import type { QuestionChapter } from "@lib/types";
import SearchBox from "./SearchBox";
import ChapterList from "./ChapterList";
import styles from "../questions.module.css";

interface IQuestionsBrowserProps {
  chapters: QuestionChapter[];
  focusChapterId?: string;
  searchPlaceholder?: string;
}

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/ё/g, "е");
}

/** Фильтрует главы, оставляя только вопросы, подходящие под запрос. */
export function filterChapters(
  chapters: QuestionChapter[],
  query: string
): QuestionChapter[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return chapters;

  return chapters
    .map((chapter) => {
      const chapterMatches = normalizeQuery(chapter.title).includes(q);
      const questions = chapterMatches
        ? chapter.questions
        : chapter.questions.filter(
            (entry) =>
              normalizeQuery(entry.question).includes(q) ||
              normalizeQuery(entry.answer).includes(q)
          );
      if (questions.length === 0) return null;
      return { ...chapter, questions };
    })
    .filter((c): c is QuestionChapter => c !== null);
}

export default function QuestionsBrowser(props: IQuestionsBrowserProps) {
  const { chapters, focusChapterId, searchPlaceholder } = props;

  const [query, setQuery] = useState("");
  const q = normalizeQuery(query);
  const searching = q.length >= 2;

  const filtered = useMemo(() => filterChapters(chapters, query), [chapters, query]);

  return (
    <div>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder ?? "Поиск по вопросам…"}
      />
      <ChapterList
        chapters={filtered}
        focusChapterId={focusChapterId}
        searching={searching}
      />
    </div>
  );
}
