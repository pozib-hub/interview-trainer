export const calledFn = () => {};

export const callbackAfterCallLimit = () => {};

export function callLimit(fn: () => void, limit: number, callback?: () => void) {
  let count = 0;
  const limited = (() => {
    if (count < limit) {
      count++;
      return fn();
    }
    if (callback) callback();
  }) as any;
  limited.reset = () => {
    count = 0;
  };
  return limited;
}
