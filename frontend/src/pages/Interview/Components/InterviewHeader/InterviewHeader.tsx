
import { Button, Spacer, ThemeToggle, Typography } from "@ui/index";

interface IInterviewHeaderProps {
  passedCount: number;
  currentIndex: number;
  taskIds: string[];
  finishEarly: () => void;
}

function InterviewHeader(props: IInterviewHeaderProps) {
  const { passedCount, currentIndex, taskIds, finishEarly } = props;

  return (
    <header className="AppHeader">
      <h1>Собеседование</h1>
      <Typography color="text-muted" size={12}>
        Задача {currentIndex + 1} из {taskIds.length} • решено: {passedCount}
      </Typography>
      <Spacer />
      <ThemeToggle />
      <Button size="sm" onClick={finishEarly}>
        Завершить
      </Button>
    </header>
  );
}

export default InterviewHeader;
