
import classNames from "@shared/lib/classNames";
import styles from "./DifficultyBadge.module.css";

const cx = classNames.bind(styles);

interface IDifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
  children?: React.ReactNode;
}

export default function DifficultyBadge(props: IDifficultyBadgeProps) {
  const { difficulty, children } = props;

  return (
    <span className={cx("Badge", { Easy: difficulty === "easy", Medium: difficulty === "medium", Hard: difficulty === "hard" })}>
      {children || difficulty}
    </span>
  );
}
