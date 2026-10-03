
import { Button, Spacer } from "@ui/index";

interface IInterviewToolbarProps {
  loading: boolean;
  code: string;
  showSolution: boolean;
  run: () => void;
  onToggleSolution: () => void;
  goPrev: () => void;
  goNext: () => void;
  currentIndex: number;
  taskIds: string[];
}

function InterviewToolbar(props: IInterviewToolbarProps) {
  const {
    loading,
    code,
    showSolution,
    run,
    onToggleSolution,
    goPrev,
    goNext,
    currentIndex,
    taskIds,
  } = props;

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 12px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <Button
        variant="primary"
        onClick={run}
        disabled={loading || !code.trim()}
      >
        {loading ? "Запуск…" : "▶ Проверить"}
      </Button>
      <Button size="sm" onClick={onToggleSolution}>
        {showSolution ? "Скрыть" : "Эталон"}
      </Button>
      <Spacer />
      <Button size="sm" onClick={goPrev} disabled={currentIndex === 0}>
        ←
      </Button>
      <Button variant="primary" size="sm" onClick={goNext}>
        {currentIndex + 1 >= taskIds.length ? "Готово ✓" : "Дальше →"}
      </Button>
    </div>
  );
}

export default InterviewToolbar;
