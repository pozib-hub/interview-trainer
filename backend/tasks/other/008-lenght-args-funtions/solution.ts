export function countArgsWrapper(fn: Function) {
  return function (...args: any[]) {
    console.log(`Передано аргументов: ${args.length}`);
    return fn.apply(this, args);
  };
}

// Тестовая функция
export function example(a: number, b: number, c?: number) {
  return a + (b || 0) + (c || 0);
}

export const wrappedExample = countArgsWrapper(example);
wrappedExample(1); // Передано аргументов: 1
wrappedExample(1, 2); // Передано аргументов: 2
wrappedExample(1, 2, 3, 4); // Передано аргументов: 4