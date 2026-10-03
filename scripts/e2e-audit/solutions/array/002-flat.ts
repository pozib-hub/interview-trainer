declare global {
  interface Array<T> {
    flatRecurs<U = T>(depth: number): U[];
    flatStack<U = T>(depth: number): U[];
  }
}

Array.prototype.flatRecurs = function <T, U = T>(this: T[], depth: number): U[] {
  const out: unknown[] = [];
  for (const item of this) {
    if (Array.isArray(item) && depth > 0) {
      out.push(...(item.flatRecurs(depth - 1) as unknown[]));
    } else {
      out.push(item);
    }
  }
  return out as U[];
};

Array.prototype.flatStack = function <T, U = T>(this: T[], depth: number): U[] {
  const out: unknown[] = [];
  const stack: { item: unknown; depth: number }[] = this
    .slice()
    .reverse()
    .map((item) => ({ item, depth }));
  while (stack.length > 0) {
    const { item, depth } = stack.pop()!;
    if (Array.isArray(item) && depth > 0) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push({ item: item[i], depth: depth - 1 });
      }
    } else {
      out.push(item);
    }
  }
  return out as U[];
};

export const example = [1, [2, [66]]];
