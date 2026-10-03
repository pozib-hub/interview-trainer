export function flatPolyfill<T>(arr: T[]): T[] {
  const stack: any[] = [...arr].reverse();
  const out: any[] = [];
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (Array.isArray(item)) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
      }
    } else {
      out.push(item);
    }
  }
  return out;
}
