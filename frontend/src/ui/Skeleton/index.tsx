
import classNames from "@shared/lib/classNames";
import styles from "./Skeleton.module.css";

const cx = classNames.bind(styles);

interface ISkeletonProps {
  line?: boolean;
  width?: number | string;
  height?: number | string;
  mt?: number | string;
  style?: React.CSSProperties;
}

function toValue(v?: number | string): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export default function Skeleton(props: ISkeletonProps) {
  const { line = false, width, height, mt, style } = props;

  const spacing: React.CSSProperties = {};
  if (width !== undefined) spacing.width = toValue(width);
  if (height !== undefined) spacing.height = toValue(height);
  if (mt !== undefined) spacing.marginTop = toValue(mt);

  return <div className={cx("Skeleton", line && "Line")} style={{ ...spacing, ...style }} />;
}
