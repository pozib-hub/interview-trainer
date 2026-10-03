export let n = 1;
export const obj = { a: 1 };
export const obj2 = { a: 1 };

export function f(x: number) {
  x = 2;
}
export function f1(o: { a: number }) {
  o.a = 5;
}
export function f2(o: { a: number }) {
  o = { a: 10 };
}

f(n);
f1(obj);
f2(obj2);
