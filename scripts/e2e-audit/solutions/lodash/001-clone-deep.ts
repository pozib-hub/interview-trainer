export const cloneDeepRecurs = (value: any): any => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeepRecurs(item));
  }
  const out: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    out[key] = cloneDeepRecurs(value[key]);
  }
  return out;
};

export const cloneDeepWhile = (value: any): any => {
  if (value === null || typeof value !== "object") return value;
  const root: any = Array.isArray(value) ? [] : {};
  const stack: { src: any; dst: any }[] = [{ src: value, dst: root }];
  while (stack.length > 0) {
    const { src, dst } = stack.pop()!;
    for (const key of Object.keys(src)) {
      const v = src[key];
      if (v !== null && typeof v === "object") {
        const childDst: any = Array.isArray(v) ? [] : {};
        dst[key] = childDst;
        stack.push({ src: v, dst: childDst });
      } else {
        dst[key] = v;
      }
    }
  }
  return root;
};
