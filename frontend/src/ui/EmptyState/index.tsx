
import classNames from "@shared/lib/classNames";
import styles from "./EmptyState.module.css";

const cx = classNames.bind(styles);

interface IEmptyStateProps {
  children: React.ReactNode;
}

export default function EmptyState(props: IEmptyStateProps) {
  const { children } = props;

  return <div className={cx("EmptyState")}>{children}</div>;
}
