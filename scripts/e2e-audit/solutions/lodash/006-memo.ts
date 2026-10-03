export const pow = (a: number): number => {
  return a * a;
};

export function memo<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();
  return function (...args: any[]) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  } as T;
}

export const memoized = memo(pow);
