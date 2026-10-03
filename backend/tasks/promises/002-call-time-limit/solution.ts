export type FN<T extends any[], R> = (...args: T) => Promise<R>;

// prettier-ignore
export const asyncLimit = <T extends any[], R>(callback: FN<T, R>, ms: number): FN<T, R> => {
  return function (...args: T) {
    return new Promise<R>((res, rej) => {
      const timerId = setTimeout(() => {
        rej(new Error("Превышен лимит времени исполнения"));
      }, ms);

      callback(...args)
        .then((data) => {
          res(data);
        })
        .catch((err) => {
          rej(err);
        })
        .finally(() => {
          clearTimeout(timerId);
        });
    });
  };
};

export const fn = async (n: number) => {
  await new Promise((res) => setTimeout(res, 100));
  return n * n;
};

asyncLimit(fn, 50)(5); // rejected: Превышен лимит времени исполнения
asyncLimit(fn, 150)(5); // resolved: 25

export const fn2 = async (a: number, b: number) => {
  await new Promise((res) => setTimeout(res, 120));

  return a + b;
};

asyncLimit(fn2, 100)(1, 2); // rejected: Превышен лимит времени исполнения
asyncLimit(fn2, 150)(1, 2); // resolved: 3

// ПЛОХОЕ РЕШЕНИЕ !!!  -----------------------------------------------------------------------------------



export const asyncLimitBAD = <T extends any[], R>(
  callback: FN<T, R>,
  ms: number
): FN<T, R> => {
  return async function (...args: T) {
    let timerId: ReturnType<typeof setTimeout> | undefined = undefined;

    try {
      timerId = setTimeout(() => {
        throw new Error("Превышен лимит времени исполнения");
      }, ms);

      return await callback(...args);
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timerId);
    }
  };
};