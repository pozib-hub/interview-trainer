export const runonce = <T extends (...args: any[]) => any>(callback: T) => {
  let called = false;
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (called) return undefined;
    called = true;
    return callback(...args);
  };
};
