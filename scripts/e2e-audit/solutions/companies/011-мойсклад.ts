export function sum(...args: number[]): number {
  return args.reduce((acc, n) => acc + n, 0);
}

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

export function getOrder(): number[] {
  return [5, 3, 1, 2, 4];
}

export const counter = (() => {
  let count = 0;
  return () => ++count;
})();

export const memoizeSum = memo(sum);
