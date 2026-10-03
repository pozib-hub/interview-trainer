
import classNames from "@shared/lib/classNames";
import styles from "./Tag.module.css";

const cx = classNames.bind(styles);

interface ITagProps {
  children: React.ReactNode;
}

export default function Tag(props: ITagProps) {
  const { children } = props;

  return <span className={cx("Tag")}>{children}</span>;
}
