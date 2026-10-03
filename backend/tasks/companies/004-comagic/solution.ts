export function getEventLoopOrder(): Promise<string[]> {
  const order: string[] = [];

  return new Promise((resolve) => {
    setTimeout(() => order.push('setTimeout 1'), 0);

    new Promise((resolve) => {
      order.push('Promise 1');
      resolve();
      order.push('Promise 2');
    }).then(() => order.push('Promise 3'));

    Promise.resolve().then(() => setTimeout(() => order.push('setTimeout 2'), 0));
    Promise.resolve().then(() => order.push('Promise 4'));

    setTimeout(() => order.push('setTimeout 3'), 0);

    order.push('final');

    setTimeout(() => {
      resolve(order);
    }, 50);
  });
}

export function testThisBinding() {
  const obj = {
    name: 'David',
    getName(this: { name: string }) {
      return `name is: ${this?.name ?? undefined}`;
    },
  };

  const unbound = obj.getName;
  const bound = obj.getName.bind(obj);

  return {
    unbound: unbound(),
    bound: bound(),
  };
}

export function debounce(fn: (...args: any[]) => void, time: number) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), time);
  };
}

export function treeFn(obj: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};

  function traverse(current: any, path?: string) {
    for (const key in current) {
      const value = current[key];
      const newPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null) {
        traverse(value, newPath);
      } else {
        result[newPath] = value;
      }
    }
  }

  traverse(obj);
  return result;
}

export const tree = {
  a: {
    b: 'two',
    c: { d: 'one' },
  },
};
