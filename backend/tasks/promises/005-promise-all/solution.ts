export const promiseAll = <T>(promises: Array<Promise<T>>) => {
  const results: T[] = new Array(promises.length);
  let count = 0;
  return new Promise<Array<T>>((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .then((res) => {
          results[i] = res;
          count++;
          if (count === promises.length) {
            resolve(results);
          }
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};
