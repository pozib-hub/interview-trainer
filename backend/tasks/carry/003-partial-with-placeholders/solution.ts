export function partial(fn: Function, args: any[]): (...restArgs: any[]) => any {
  return function (...restArgs: any[]): any {
    const bound = args.slice();
    let i = 0;
    for (let j = 0; j < bound.length; ++j) {
      if (bound[j] === "_") {
        bound[j] = restArgs[i++];
      }
    }
    while (i < restArgs.length) {
      bound.push(restArgs[i++]);
    }
    return fn(...bound);
  };
}
