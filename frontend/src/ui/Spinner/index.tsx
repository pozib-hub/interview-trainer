
import classNames from "@shared/lib/classNames";
import styles from "./Spinner.module.css";

const cx = classNames.bind(styles);

interface ISpinnerProps {
  size?: "default" | "big";
  mr?: number | string;
  style?: React.CSSProperties;
}

function toValue(v?: number | string): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export default function Spinner(props: ISpinnerProps) {
  const { size = "default", mr, style } = props;

  const spacing: React.CSSProperties = {};
  if (mr !== undefined) spacing.marginRight = toValue(mr);

  return (
    <span
      className={cx("Spinner")}
      style={{ ...(size === "big" ? { width: 24, height: 24, borderWidth: 3 } : {}), ...spacing, ...style }}
    />
  );
}
