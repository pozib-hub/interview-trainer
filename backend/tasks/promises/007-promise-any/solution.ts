export function promiseAny<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], "All promises were rejected"));
      return;
    }
    let rejections: any[] = [];
    let rejectedCount = 0;
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve).catch((err) => {
        rejections.push(err);
        rejectedCount++;
        if (rejectedCount === promises.length) {
          reject(new AggregateError(rejections, "All promises were rejected"));
        }
      });
    }
  });
}
