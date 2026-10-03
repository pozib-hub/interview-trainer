export function flatPolyfill<T>(arr: T[]): T[] {
  const result: T[] = [];
  const stack: unknown[] = [...arr];

  while (stack.length > 0) {
    const item = stack.shift();
    if (Array.isArray(item)) {
      stack.unshift(...item);
    } else {
      result.push(item as T);
    }
  }

  return result;
}
