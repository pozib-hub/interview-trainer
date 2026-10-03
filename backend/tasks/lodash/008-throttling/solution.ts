export function throttling<T extends (...args: any[]) => void>(
  callback: T,
  wait: number
) {
  let shouldBeCalled = true;
  return (...args: Parameters<T>) => {
    if (!shouldBeCalled) return;
    shouldBeCalled = false;
    setTimeout(() => {
      shouldBeCalled = true;
    }, wait);
    callback(...args);
  };
}
