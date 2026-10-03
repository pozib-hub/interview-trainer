import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import type { TaskSummary } from "@lib/types";
import TaskTree from "@components/TaskTree";
import UserMenu from "@components/UserMenu";
import TaskProposalModal from "@components/TaskProposalModal";
import { useResizableLayout, DragHandle } from "@hooks/useResizableLayout";
import { useAppData } from "@hooks/useAppData";
import { fetchTopics } from "@lib/taskApi";
import { Box, Button, Skeleton, Spacer, Spinner, ThemeToggle, Typography } from "@ui/index";

export default function TasksLayout() {
  const [topics, setTopics] = useState<Record<string, TaskSummary[]>>({});
  const [proposalOpen, setProposalOpen] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const { layout, startDrag, containerRef } = useResizableLayout();
  const app = useAppData();

  useEffect(() => {
    fetchTopics().then((data) => setTopics(data));
  }, []);

  const taskCount = Object.values(topics).flat().length;
  const loadingTasks = taskCount === 0;
  const dueIds = useMemo(() => new Set(app.dueReviewIds), [app.dueReviewIds]);

  const displayedTopics = useMemo(() => {
    if (!reviewOnly || dueIds.size === 0) return topics;
    const filtered: Record<string, TaskSummary[]> = {};
    for (const [topic, tasks] of Object.entries(topics)) {
      const due = tasks.filter((t) => dueIds.has(t.id));
      if (due.length > 0) filtered[topic] = due;
    }
    return filtered;
  }, [topics, reviewOnly, dueIds]);

  const handleClearSolved = () => {
    if (app.solvedList.length === 0) return;
    if (confirm(`Сбросить все решённые задачи (${app.solvedList.length})?`)) {
      app.clearSolved();
    }
  };

  return (
    <div className="AppShell">
      <header className="AppHeader">
        <h1>Interview Trainer</h1>
        <Typography color="text-muted" size={12}>
          {loadingTasks ? (
            <>
              <Spinner mr={6} />
              Загрузка…
            </>
          ) : (
            <>
              {taskCount} задач
              {app.solvedList.length > 0 && (
                <Typography tag="span" color="green" ml={8}>
                  • решено: {app.solvedList.length}
                </Typography>
              )}
            </>
          )}
        </Typography>
        <Spacer />
        {app.solvedList.length > 0 && (
          <Button
            size="sm"
            onClick={handleClearSolved}
            title="Сбросить все решённые задачи"
          >
            Сбросить решённые
          </Button>
        )}
        <ThemeToggle />
        <UserMenu />
        {app.dueReviewIds.length > 0 && (
          <Button
            size="sm"
            onClick={() => setReviewOnly((v) => !v)}
            title={reviewOnly ? "Показать все задачи" : "Показать только задачи к повторению"}
            style={reviewOnly ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
          >
            🔁 К повторению: {app.dueReviewIds.length}
          </Button>
        )}
        <Button size="sm" href="/interview">🎯 Собеседование</Button>
        <Button size="sm" href="/progress" title="Дашборд прогресса: активность, темы, рекомендации">📊 Прогресс</Button>
        <Button size="sm" variant="primary" onClick={() => setProposalOpen(true)} title="Предложить новую задачу — ИИ сгенерирует её и откроет pull request">
          ➕ Добавить задачу
        </Button>
      </header>
      <div className="AppBody" ref={containerRef}>
        <aside
          className="Sidebar"
          style={{ width: layout.sidebar, flexShrink: 0 }}
        >
          <TaskTree
            topics={displayedTopics}
            isSolved={app.isSolved}
            onToggleSolved={app.toggleSolved}
            isReviewDue={app.isReviewDue}
          />
          {reviewOnly && (
            <Box p={12}>
              <Typography size={12} color="text-muted" mb={8}>
                Показаны только задачи к повторению. Реши их с чистого листа — интервал вырастет.
              </Typography>
              <Button size="sm" onClick={() => setReviewOnly(false)}>Показать все</Button>
            </Box>
          )}
          {loadingTasks && (
            <Box p={16}>
              <Skeleton line width="60%" />
              <Skeleton line width="80%" />
              <Skeleton line width="50%" />
              <Skeleton line width="70%" />
              <Skeleton line width="65%" />
            </Box>
          )}
        </aside>
        <DragHandle
          onMouseDown={(e: React.MouseEvent) => startDrag("sidebar", e)}
        />
        <main className="Main">
          <Outlet />
        </main>
      </div>
      <TaskProposalModal open={proposalOpen} onClose={() => setProposalOpen(false)} />
    </div>
  );
}
