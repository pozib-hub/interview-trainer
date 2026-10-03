export const pow = (a: number): number => a * a;

export function memo<T extends (...args: any[]) => any>(fn: T): T {
  const hash = new Map<any, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = args.length === 1 ? args[0] : args.join("|"); // Улучшенный ключ кеша

    if (!hash.has(key)) {
      const res = fn(...args);
      hash.set(key, res);
      return res;
    }

    return hash.get(key)!;
  }) as T;
}

export const memoized = memo(pow);

console.log(memoized(4)); // 16
console.log(memoized(4)); // 16 (из кеша)
console.log(memoized(5)); // 25
console.log(memoized(5)); // 25 (из кеша)