export type FN<T extends any[], R> = (...args: T) => Promise<R>;

export const asyncLimit = (fn: (...args: any[]) => Promise<any>, ms: number) => {
  return (...args: any[]) => {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Превышен лимит времени исполнения")), ms)
      ),
    ]);
  };
};

export const fn = async (n: number) => {
  await new Promise((res) => setTimeout(res, 100));
  return n * n;
};

export const fn2 = async (a: number, b: number) => {
  await new Promise((res) => setTimeout(res, 120));
  return a + b;
};

export const asyncLimitBAD = asyncLimit;
