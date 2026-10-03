export function createInfiniteObject(): Record<string, () => string> {
  return new Proxy({} as Record<string, () => string>, {
    get(_target, prop: string) {
      return () => prop;
    },
  });
}
