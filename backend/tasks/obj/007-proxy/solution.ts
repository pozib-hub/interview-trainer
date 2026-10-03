export function getResult(): string[] {
  const obj = new Proxy(
    {} as Record<string, unknown>,
    {
      set(target, prop, value) {
        target[prop] = String(value);
        return true;
      },
    }
  );

  obj.foo = 1;
  const r1 = typeof obj.foo;
  obj.foo = true;
  const r2 = typeof obj.foo;
  obj.foo = {};
  const r3 = typeof obj.foo;

  return [r1, r2, r3];
}
