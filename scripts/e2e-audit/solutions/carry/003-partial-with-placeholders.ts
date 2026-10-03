export function partial(fn: Function, args: any[]): (...restArgs: any[]) => any {
  return function (...restArgs: any[]) {
    const merged = [...args];
    let restIndex = 0;
    for (let i = 0; i < merged.length; i++) {
      if (merged[i] === "_") {
        merged[i] = restArgs[restIndex++];
      }
    }
    while (restIndex < restArgs.length) {
      merged.push(restArgs[restIndex++]);
    }
    return fn(...merged);
  };
}
