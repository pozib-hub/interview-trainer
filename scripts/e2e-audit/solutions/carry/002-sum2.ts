export function sum(a: number, b: number, c: number): number {
  return a + b + c;
}
export function x2(a: number, b: number): number {
  return a + b;
}
export function curry(fn: (...args: any[]) => any) {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function (...more: any[]) {
      return curried(...args, ...more);
    };
  };
}
export function curry2(fn: (...args: any[]) => any) {
  return curry(fn);
}
export const curried = curry(sum);
