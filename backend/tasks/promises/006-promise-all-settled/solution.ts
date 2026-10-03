export type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

export function promiseAllSettled<T>(promises: Array<Promise<T>>): Promise<Array<SettledResult<T>>> {
  const results: Array<SettledResult<T>> = new Array(promises.length);
  let count = 0;
  return new Promise<Array<SettledResult<T>>>((resolve) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .then((res) => {
          results[i] = { status: "fulfilled", value: res };
        })
        .catch((err) => {
          results[i] = { status: "rejected", reason: err };
        })
        .finally(() => {
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        });
    }
  });
}
