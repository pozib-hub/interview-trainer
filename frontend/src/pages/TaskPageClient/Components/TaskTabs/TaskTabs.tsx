
import classNames from "@shared/lib/classNames";
import { Button, Spacer } from "@ui/index";
import styles from "./TaskTabs.module.css";

const cx = classNames.bind(styles);

interface ITaskTabsProps {
  tab: "condition" | "solution";
  onSetTab: (tab: "condition" | "solution") => void;
  isTaskSolved: boolean;
  onToggleSolved: () => void;
}

function TaskTabs(props: ITaskTabsProps) {
  const { tab, onSetTab, isTaskSolved, onToggleSolved } = props;

  return (
    <div className={cx("Tabs")}>
      <div
        className={cx("Tab", { TabActive: tab === "condition" })}
        onClick={() => onSetTab("condition")}
      >
        Условие
      </div>
      <div
        className={cx("Tab", { TabActive: tab === "solution" })}
        onClick={() => onSetTab("solution")}
      >
        Решение
      </div>
      <Spacer />
      {isTaskSolved && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "center",
            color: "var(--green)",
            fontSize: 12,
            marginRight: 12,
          }}
        >
          ✓ Решено
          <Button
            size="sm"
            onClick={onToggleSolved}
            title="Отметить как нерешённую"
            style={{ padding: "2px 8px", fontSize: 11 }}
          >
            Сбросить
          </Button>
        </span>
      )}
    </div>
  );
}

export default TaskTabs;
