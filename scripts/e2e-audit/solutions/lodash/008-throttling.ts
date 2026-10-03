export function throttling<T extends (...args: any[]) => void>(
  callback: T,
  wait: number
): T {
  let lastCall = 0;
  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      callback(...args);
    }
  };
  return throttled as T;
}
