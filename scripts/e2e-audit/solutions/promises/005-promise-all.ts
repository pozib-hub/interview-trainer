export const promiseAll = <T>(promises: Array<Promise<T>>): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    let pending = promises.length;
    if (pending === 0) {
      resolve([]);
      return;
    }
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          results[i] = value;
          pending--;
          if (pending === 0) resolve(results);
        },
        (reason) => reject(reason)
      );
    });
  });
};
