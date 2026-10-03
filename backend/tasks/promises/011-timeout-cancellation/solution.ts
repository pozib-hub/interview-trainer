export function cancellable(fn: Function, args: any[], t: number): () => void {
  const timeoutId = setTimeout(() => fn(...args), t);
  return () => clearTimeout(timeoutId);
}
