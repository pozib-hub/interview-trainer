// 1. counter — функция, возвращающая инкремент
export const counter = (() => {
  let count = 0;
  return function () {
    count++;
    return count;
  };
})();

// 2. memoize — мемоизация функции
export function memo<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (!cache.has(key)) {
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }

    return cache.get(key)!;
  }) as T;
}

// 3. memoized sum
export function sum(...args: number[]): number {
  return args.reduce((a, b) => a + b, 0);
}

export const memoizeSum = memo(sum);

// 4. Порядок вывода: 5, 3, 1, 2, 4
export function getOrder(): number[] {
  return [5, 3, 1, 2, 4];
}
