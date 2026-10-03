export function promiseAny<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    const errors: any[] = new Array(promises.length);
    let rejectedCount = 0;
    let settled = false;
    if (promises.length === 0) {
      reject(new AggregateError([], "All promises were rejected"));
      return;
    }
    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        },
        (reason) => {
          errors[i] = reason;
          rejectedCount++;
          if (rejectedCount === promises.length && !settled) {
            reject(new AggregateError(errors, "All promises were rejected"));
          }
        }
      );
    });
  });
}
