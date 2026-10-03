
type TextColor = "text" | "text-muted" | "green" | "red" | "accent" | "yellow" | string;

type TagType = "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface ITypographyProps {
  size?: number | string;
  weight?: number | string;
  color?: TextColor;
  align?: React.CSSProperties["textAlign"];
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  m?: number | string;
  lineHeight?: number | string;
  textDecoration?: React.CSSProperties["textDecoration"];
  textOverflow?: React.CSSProperties["textOverflow"];
  whiteSpace?: React.CSSProperties["whiteSpace"];
  opacity?: React.CSSProperties["opacity"];
  float?: React.CSSProperties["float"];
  tag?: TagType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_MAP: Record<string, string> = {
  text: "var(--text)",
  "text-muted": "var(--text-muted)",
  green: "var(--green)",
  red: "var(--red)",
  accent: "var(--accent)",
  yellow: "var(--yellow)",
};

export default function Typography(props: ITypographyProps) {
  const {
    size,
    weight,
    color,
    align,
    mt, mr, mb, ml, m,
    lineHeight, textDecoration, textOverflow, whiteSpace, opacity, float,
    tag: Tag = "div",
    children,
    className,
    style,
  } = props;

  const typography: React.CSSProperties = {};

  if (size !== undefined) typography.fontSize = typeof size === "number" ? `${size}px` : size;
  if (weight !== undefined) typography.fontWeight = weight;
  if (color !== undefined) typography.color = COLOR_MAP[color] || color;
  if (align !== undefined) typography.textAlign = align;
  if (mt !== undefined) typography.marginTop = typeof mt === "number" ? `${mt}px` : mt;
  if (mr !== undefined) typography.marginRight = typeof mr === "number" ? `${mr}px` : mr;
  if (mb !== undefined) typography.marginBottom = typeof mb === "number" ? `${mb}px` : mb;
  if (ml !== undefined) typography.marginLeft = typeof ml === "number" ? `${ml}px` : ml;
  if (m !== undefined) typography.margin = typeof m === "number" ? `${m}px` : m;
  if (lineHeight !== undefined) typography.lineHeight = lineHeight;
  if (textDecoration !== undefined) typography.textDecoration = textDecoration;
  if (textOverflow !== undefined) typography.textOverflow = textOverflow;
  if (whiteSpace !== undefined) typography.whiteSpace = whiteSpace;
  if (opacity !== undefined) typography.opacity = opacity;
  if (float !== undefined) typography.float = float;

  return (
    <Tag className={className} style={{ ...typography, ...style }}>
      {children}
    </Tag>
  );
}
