
interface ISpacerProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function Spacer(props: ISpacerProps) {
  const { className, style } = props;

  return (
    <div
      className={className}
      style={{ flex: 1, ...style }}
    />
  );
}
