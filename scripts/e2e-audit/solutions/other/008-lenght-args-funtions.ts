export function countArgsWrapper(fn: Function) {
  return (...args: any[]) => {
    console.log(`Передано аргументов: ${args.length}`);
    return fn(...args);
  };
}
export function example(a: number, b: number, c?: number) {
  return a + b + (c ?? 0);
}
export const wrappedExample = countArgsWrapper(example);
