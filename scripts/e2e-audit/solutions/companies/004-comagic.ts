export function getEventLoopOrder(): Promise<string[]> {
  return Promise.resolve([
    "Promise 1",
    "Promise 2",
    "final",
    "Promise 3",
    "Promise 4",
    "setTimeout 1",
    "setTimeout 3",
    "setTimeout 2",
  ]);
}

export function testThisBinding() {
  const obj = { name: "David" };
  const sayName = function (this: any) {
    return `name is: ${this?.name}`;
  };
  return {
    unbound: sayName(),
    bound: sayName.bind(obj)(),
  };
}

export function debounce(fn: Function, time: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, time);
  };
}

export function treeFn(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      Object.assign(out, treeFn(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}

export const tree = {
  a: {
    b: "two",
    c: { d: "one" },
  },
};
