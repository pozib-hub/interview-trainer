
import type { AppDataContextValue } from "@hooks/useAppData";
import classNames from "@shared/lib/classNames";
import { Box, Button, Spacer, ThemeToggle, Typography } from "@ui/index";
import UserMenu from "@components/UserMenu";
import styles from "./InterviewSetupPhase.module.css";

const cx = classNames.bind(styles);

interface IInterviewSetupPhaseProps {
  allTasks: any[];
  app: AppDataContextValue;
  startInterview: () => void;
}

function InterviewSetupPhase(props: IInterviewSetupPhaseProps) {
  const { allTasks, app, startInterview } = props;

  const solvedCount = app.solvedList.length;
  const usedCount = app.getUsedTaskIds().size;
  const totalTasks = allTasks.length;

  return (
    <div className="AppShell">
      <header className="AppHeader">
        <h1>Interview Trainer</h1>
        <Spacer />
        <ThemeToggle />
        <UserMenu />
        <Button size="sm" href="/tasks">← К списку задач</Button>
      </header>
      <Box className="Main" alignItems="center" justifyContent="center">
        <Box p={40} maxWidth={520} width="100%">
          <Typography tag="h2" mb={8}>Режим собеседования</Typography>
          <Typography tag="p" color="text-muted" mb={24} lineHeight={1.6}>
            Случайно выбираются 5–7 задач из разных тем. Задачи, которые уже
            были в прошлых тренировках, не повторяются (или повторяются
            минимально).
          </Typography>

          <Box display="flex" gap={16} mb={24}>
            <div className={cx("StatCard")}>
              <div className={cx("StatValue")}>{totalTasks}</div>
              <div className={cx("StatLabel")}>Всего задач</div>
            </div>
            <div className={cx("StatCard")}>
              <div className={cx("StatValue")}>{solvedCount}</div>
              <div className={cx("StatLabel")}>Решено</div>
            </div>
            <div className={cx("StatCard")}>
              <div className={cx("StatValue")}>{app.sessions.length}</div>
              <div className={cx("StatLabel")}>Тренировок</div>
            </div>
            <div className={cx("StatCard")}>
              <div className={cx("StatValue")}>{usedCount}</div>
              <div className={cx("StatLabel")}>Пройдено в тренировках</div>
            </div>
          </Box>

          <Button
            variant="primary"
            block
            onClick={startInterview}
            disabled={allTasks.length < 5}
            style={{ padding: "12px", fontSize: 15 }}
          >
            {allTasks.length < 5 ? "Загрузка задач…" : "▶ Начать тренировку"}
          </Button>

          {app.sessions.length > 0 && (
            <Box mt={32}>
              <Typography tag="h3" size={14} mb={12}>
                История тренировок
              </Typography>
              {app.sessions.slice(0, 5).map((s) => {
                const passed = Object.values(s.results).filter(Boolean).length;
                return (
                  <div key={s.id} className={cx("HistoryItem")}>
                    <Typography color="text-muted">
                      {new Date(s.date).toLocaleString("ru-RU")}
                    </Typography>
                    <span>
                      {passed}/{s.taskIds.length} решено
                    </span>
                    <span
                      style={{
                        color:
                          passed === s.taskIds.length
                            ? "var(--green)"
                            : "var(--text-muted)",
                      }}
                    >
                      {passed === s.taskIds.length ? "✓" : "○"}
                    </span>
                  </div>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default InterviewSetupPhase;
