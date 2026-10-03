export function getResult(): string[] {
  const target: Record<string, any> = {};
  const obj = new Proxy(target, {
    set(t, prop: string, value) {
      t[prop] = String(value);
      return true;
    },
    get(t, prop: string) {
      return t[prop];
    },
  });
  obj.foo = 1;
  const r1 = typeof obj.foo;
  obj.foo = true;
  const r2 = typeof obj.foo;
  obj.foo = {};
  const r3 = typeof obj.foo;
  return [r1, r2, r3];
}
