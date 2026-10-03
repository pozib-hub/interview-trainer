
import classNames from "@shared/lib/classNames";
import styles from "./DragHandle.module.css";

const cx = classNames.bind(styles);

export function DragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 4,
        background: "var(--border)",
        cursor: "col-resize",
        flexShrink: 0,
        zIndex: 10,
      }}
      className={cx("DragHandle")}
    />
  );
}

export function HDragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        height: 4,
        background: "var(--border)",
        cursor: "row-resize",
        flexShrink: 0,
        zIndex: 10,
      }}
      className={cx("DragHandle", "HDrag")}
    />
  );
}
