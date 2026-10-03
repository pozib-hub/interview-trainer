
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import type { TaskSummary } from "@lib/types";
import classNames from "@shared/lib/classNames";
import styles from "./TaskTree.module.css";
import TopicGroup from "./Components/TopicGroup/TopicGroup";
import { Box, Typography } from "@ui/index";

const cx = classNames.bind(styles);

interface ITaskTreeProps {
  topics: Record<string, TaskSummary[]>;
  isSolved: (taskId: string) => boolean;
  onToggleSolved: (taskId: string) => void;
  isReviewDue?: (taskId: string) => boolean;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "var(--green)",
  medium: "var(--yellow)",
  hard: "var(--red)",
};

export default function TaskTree(props: ITaskTreeProps) {
  const { topics, isSolved, onToggleSolved, isReviewDue } = props;
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [hideSolved, setHideSolved] = useState(false);

  const currentId = pathname?.startsWith("/tasks/")
    ? decodeURIComponent(pathname.replace("/tasks/", ""))
    : null;

  const topicNames = Object.keys(topics).sort();

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !hideSolved) return null;

    const result: Record<string, TaskSummary[]> = {};
    for (const topic of topicNames) {
      const tasks = (topics[topic] || []).filter((t) => {
        if (hideSolved && isSolved(t.id)) return false;
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
      if (tasks.length > 0) result[topic] = tasks;
    }
    return result;
  }, [query, hideSolved, topics, isSolved, topicNames]);

  const displayTopics = filteredTopics ?? Object.fromEntries(
    topicNames.map((t) => [t, topics[t]])
  );
  const displayNames = Object.keys(displayTopics).sort();
  const totalShown = Object.values(displayTopics).flat().length;

  if (topicNames.length === 0) {
    return (
      <Box p={16}><Typography color="text-muted">Загрузка…</Typography></Box>
    );
  }

  return (
    <nav>
      <div className={cx("SearchBox")}>
        <input
          type="text"
          placeholder="Поиск задач…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cx("SearchInput")}
        />
        {query && (
          <button
            className={cx("SearchClear")}
            onClick={() => setQuery("")}
            title="Очистить"
          >
            ✕
          </button>
        )}
        <button
          className={cx("FilterBtn", { FilterBtnActive: hideSolved })}
          onClick={() => setHideSolved((v) => !v)}
          title="Скрыть решённые"
        >
          {hideSolved ? "◐" : "○"}
        </button>
      </div>

      {(query || hideSolved) && (
        <div className={cx("SearchCount")}>
          Найдено: {totalShown}
        </div>
      )}

      {displayNames.length === 0 ? (
        <Box p={16}><Typography color="text-muted" size={13}>Ничего не найдено</Typography></Box>
      ) : (
        displayNames.map((topic) => {
          const tasks = displayTopics[topic] || [];
          return (
            <TopicGroup
              key={topic}
              topic={topic}
              tasks={tasks}
              currentId={currentId}
              isSolved={isSolved}
              onToggleSolved={onToggleSolved}
              isReviewDue={isReviewDue}
            />
          );
        })
      )}
    </nav>
  );
}
