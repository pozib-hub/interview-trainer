
import { Link } from "react-router-dom";
import type { TaskSummary } from "@lib/types";
import classNames from "@shared/lib/classNames";
import styles from "../../TaskTree.module.css";
import { Typography } from "@ui/index";

const cx = classNames.bind(styles);

interface ITopicGroupProps {
  topic: string;
  tasks: TaskSummary[];
  currentId: string | null;
  isSolved: (taskId: string) => boolean;
  onToggleSolved: (taskId: string) => void;
  isReviewDue?: (taskId: string) => boolean;
}

const DIFF_COLOR: Record<string, string> = {
  easy: "var(--green)",
  medium: "var(--yellow)",
  hard: "var(--red)",
};

function TopicGroup(props: ITopicGroupProps) {
  const { topic, tasks, currentId, isSolved, onToggleSolved, isReviewDue } = props;

  const solvedCount = tasks.filter((t) => isSolved(t.id)).length;

  return (
    <div className={cx("TopicGroup")}>
      <div className={cx("TopicTitle")}>
        {topic}
        {solvedCount > 0 && (
          <Typography tag="span" color="green" ml={6} size={10}>
            {solvedCount}/{tasks.length}
          </Typography>
        )}
      </div>
      {tasks.map((task) => {
        const active = task.id === currentId;
        const solved = isSolved(task.id);
        return (
          <Link
            key={task.id}
            to={`/tasks/${task.id}`}
            className={cx("TaskItem", { TaskItemActive: active })}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <span
              className={cx("Dot", { DotSolved: solved })}
              style={{
                borderColor: solved ? "var(--green)" : DIFF_COLOR[task.difficulty],
                background: solved ? "var(--green)" : "transparent",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSolved(task.id);
              }}
              title={solved ? "Отметить как нерешённую" : "Отметить как решённую"}
            />
            <span className={cx("Label")} style={{ textDecoration: solved ? "line-through" : "none", opacity: solved ? 0.7 : 1 }}>
              {task.title}
            </span>
            {isReviewDue?.(task.id) && (
              <span className={cx("ReviewBadge")} title="Задача на повторении — реши её с чистого листа">
                🔁
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default TopicGroup;
