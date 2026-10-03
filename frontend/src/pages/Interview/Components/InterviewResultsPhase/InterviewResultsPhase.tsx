
import { Box, Button, Spacer, ThemeToggle, Typography } from "@ui/index";
import classNames from "@shared/lib/classNames";
import styles from "./InterviewResultsPhase.module.css";

const cx = classNames.bind(styles);

interface IInterviewResultsPhaseProps {
  taskIds: string[];
  results: Record<string, boolean>;
  onNewInterview: () => void;
}

function InterviewResultsPhase(props: IInterviewResultsPhaseProps) {
  const { taskIds, results, onNewInterview } = props;

  const passedCount = Object.values(results).filter(Boolean).length;
  const total = taskIds.length;

  return (
    <div className="AppShell">
      <header className="AppHeader">
        <h1>Результаты тренировки</h1>
        <Spacer />
        <ThemeToggle />
      </header>
      <Box className="Main" alignItems="center" justifyContent="center">
        <Box p={40} maxWidth={600} width="100%">
          <Box textAlign="center" mb={32}>
            <Typography
              size={48}
              weight={700}
              color={passedCount === total ? "green" : "accent"}
            >
              {passedCount}/{total}
            </Typography>
            <Typography color="text-muted" mt={8}>
              {passedCount === total
                ? "Все задачи решены!"
                : `${total - passedCount} задач не решено`}
            </Typography>
          </Box>

          <Box mb={32}>
            {taskIds.map((id, i) => {
              const passed = results[id];
              return (
                <div key={id} className={cx("HistoryItem")}>
                  <div className={cx("HistoryNum")}>#{i + 1}</div>
                  <div className={cx("HistoryName")}>{id}</div>
                  <div className={cx(passed ? "HistoryStatusPass" : "HistoryStatusFail")}>
                    {passed ? "✓ Решено" : "✗ Не решено"}
                  </div>
                </div>
              );
            })}
          </Box>

          <Box display="flex" flexDirection="column" gap="20px">
            <Button block href="/tasks" size="lg">
              На главную
            </Button>

            <Button variant="primary" block size="lg" onClick={onNewInterview}>
              Новая тренировка
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default InterviewResultsPhase;
