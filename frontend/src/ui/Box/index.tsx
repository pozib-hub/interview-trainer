
interface IBoxProps {
  p?: number | string;
  px?: number | string;
  py?: number | string;
  pt?: number | string;
  pr?: number | string;
  pb?: number | string;
  pl?: number | string;
  m?: number | string;
  mx?: number | string;
  my?: number | string;
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  gap?: number | string;
  display?: React.CSSProperties["display"];
  flexDirection?: React.CSSProperties["flexDirection"];
  alignItems?: React.CSSProperties["alignItems"];
  justifyContent?: React.CSSProperties["justifyContent"];
  textAlign?: React.CSSProperties["textAlign"];
  flexWrap?: React.CSSProperties["flexWrap"];
  flex?: React.CSSProperties["flex"];
  flexShrink?: React.CSSProperties["flexShrink"];
  overflow?: React.CSSProperties["overflow"];
  overflowX?: React.CSSProperties["overflowX"];
  overflowY?: React.CSSProperties["overflowY"];
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  background?: string;
  borderBottom?: React.CSSProperties["borderBottom"];
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function toValue(v?: number | string): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export default function Box(props: IBoxProps) {
  const {
    p, px, py, pt, pr, pb, pl,
    m, mx, my, mt, mr, mb, ml,
    gap, display, flexDirection, alignItems, justifyContent, textAlign, flexWrap,
    flex, flexShrink, overflow, overflowX, overflowY,
    width, height, maxWidth, minHeight, background, borderBottom,
    children, className, style,
  } = props;

  const spacing: React.CSSProperties = {};

  if (p !== undefined) spacing.padding = toValue(p);
  if (px !== undefined) spacing.paddingInline = toValue(px);
  if (py !== undefined) spacing.paddingBlock = toValue(py);
  if (pt !== undefined) spacing.paddingTop = toValue(pt);
  if (pr !== undefined) spacing.paddingRight = toValue(pr);
  if (pb !== undefined) spacing.paddingBottom = toValue(pb);
  if (pl !== undefined) spacing.paddingLeft = toValue(pl);

  if (m !== undefined) spacing.margin = toValue(m);
  if (mx !== undefined) spacing.marginInline = toValue(mx);
  if (my !== undefined) spacing.marginBlock = toValue(my);
  if (mt !== undefined) spacing.marginTop = toValue(mt);
  if (mr !== undefined) spacing.marginRight = toValue(mr);
  if (mb !== undefined) spacing.marginBottom = toValue(mb);
  if (ml !== undefined) spacing.marginLeft = toValue(ml);

  if (gap !== undefined) spacing.gap = toValue(gap);
  if (display !== undefined) spacing.display = display;
  if (flexDirection !== undefined) spacing.flexDirection = flexDirection;
  if (alignItems !== undefined) spacing.alignItems = alignItems;
  if (justifyContent !== undefined) spacing.justifyContent = justifyContent;
  if (textAlign !== undefined) spacing.textAlign = textAlign;
  if (flexWrap !== undefined) spacing.flexWrap = flexWrap;
  if (flex !== undefined) spacing.flex = flex;
  if (flexShrink !== undefined) spacing.flexShrink = flexShrink;
  if (overflow !== undefined) spacing.overflow = overflow;
  if (overflowX !== undefined) spacing.overflowX = overflowX;
  if (overflowY !== undefined) spacing.overflowY = overflowY;
  if (width !== undefined) spacing.width = toValue(width);
  if (height !== undefined) spacing.height = toValue(height);
  if (maxWidth !== undefined) spacing.maxWidth = toValue(maxWidth);
  if (minHeight !== undefined) spacing.minHeight = toValue(minHeight);
  if (background !== undefined) spacing.background = background;
  if (borderBottom !== undefined) spacing.borderBottom = borderBottom;

  return (
    <div className={className} style={{ ...spacing, ...style }}>
      {children}
    </div>
  );
}
