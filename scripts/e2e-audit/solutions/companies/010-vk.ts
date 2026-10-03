export function flatPolyfill<T>(arr: any[]): T[] {
  const stack: any[] = [...arr].reverse();
  const out: any[] = [];
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (Array.isArray(item)) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
      }
    } else {
      out.push(item);
    }
  }
  return out;
}

export function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
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
}
