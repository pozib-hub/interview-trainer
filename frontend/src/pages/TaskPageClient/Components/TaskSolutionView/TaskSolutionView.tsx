
import { Button, Typography } from "@ui/index";

interface ITaskSolutionViewProps {
  showSolution: boolean;
  onToggleSolution: () => void;
  solution: string;
}

function TaskSolutionView(props: ITaskSolutionViewProps) {
  const { showSolution, onToggleSolution, solution } = props;

  return (
    <div className="condition">
      <Button size="sm" onClick={onToggleSolution}>
        {showSolution ? "Скрыть эталон" : "Показать эталонное решение"}
      </Button>
      {showSolution ? (
        <pre
          style={{
            marginTop: 12,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: 12,
            fontSize: 13,
          }}
        >
          <code>{solution}</code>
        </pre>
      ) : (
        <Typography tag="p" color="text-muted" mt={12}>
          Эталон скрыт. Сначала попробуйте решить самостоятельно.
        </Typography>
      )}
    </div>
  );
}

export default TaskSolutionView;
