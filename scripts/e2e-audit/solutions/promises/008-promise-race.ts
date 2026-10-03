export function promiseRace<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);
    }
  });
}
