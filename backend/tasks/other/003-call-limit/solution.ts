export function callLimit<T extends (...args: any[]) => void>(
  fn: T,
  limit: number,
  callback?: () => void
) {
  let countLimit = 0;

  const func = function (...args: Parameters<T>) {
    if (limit <= countLimit) {
      setTimeout(() => callback?.(), 0);
      return;
    }

    countLimit++;
    return fn(...args);
  } as T & { reset: () => void };

  func.reset = () => {
    countLimit = 0;
  };

  return func;
}

export const calledFn = () => console.log("calledFn");
export const callbackAfterCallLimit = () => console.log("callbackAfterCallLimit");

export const fn = callLimit(calledFn, 3, callbackAfterCallLimit);

fn(); // "calledFn"
fn(); // "calledFn"
fn(); // "calledFn"
fn(); // (ничего) и вызов "callbackAfterCallLimit"
fn.reset();
fn(); // "calledFn" (лимит сброшен)