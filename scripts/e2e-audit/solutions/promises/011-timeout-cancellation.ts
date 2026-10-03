export function cancellable(fn: Function, args: any[], t: number): () => void {
  const timer = setTimeout(() => {
    fn(...args);
  }, t);
  return () => {
    clearTimeout(timer);
  };
}
