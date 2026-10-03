export var n = 1;

export function f(n: number) {
  n = 3;
}

f(n);

export var obj = { a: 1 };

export function f1(o: { a: number }) {
  o.a = 5;
}
f1(obj);

export var obj2 = { a: 1 };
export function f2(o: { a: number }) {
  o = { hello: 1 };
}

f2(obj2);
