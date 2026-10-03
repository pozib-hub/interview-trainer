
import classNames from "@shared/lib/classNames";
import styles from "./InterviewProgressBar.module.css";

const cx = classNames.bind(styles);

interface IInterviewProgressBarProps {
  taskIds: string[];
  results: Record<string, boolean>;
  currentIndex: number;
  onSwitchTask: (index: number) => void;
}

function InterviewProgressBar(props: IInterviewProgressBarProps) {
  const { taskIds, results, currentIndex, onSwitchTask } = props;

  return (
    <div className={cx("Progress")}>
      {taskIds.map((id, i) => {
        const r = results[id];
        const isCurrent = i === currentIndex;
        return (
          <div
            key={id}
            className={cx("Step", { StepCurrent: isCurrent, StepDone: r === true, StepFail: r === false })}
            onClick={() => onSwitchTask(i)}
            title={id}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
}

export default InterviewProgressBar;
