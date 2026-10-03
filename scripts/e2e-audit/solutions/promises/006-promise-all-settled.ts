export type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

export const promiseAllSettled = <T>(
  promises: Array<Promise<T>>
): Promise<SettledResult<T>[]> => {
  return new Promise((resolve) => {
    const results: SettledResult<T>[] = new Array(promises.length);
    let pending = promises.length;
    if (pending === 0) {
      resolve([]);
      return;
    }
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          results[i] = { status: "fulfilled", value };
          pending--;
          if (pending === 0) resolve(results);
        },
        (reason) => {
          results[i] = { status: "rejected", reason };
          pending--;
          if (pending === 0) resolve(results);
        }
      );
    });
  });
};
