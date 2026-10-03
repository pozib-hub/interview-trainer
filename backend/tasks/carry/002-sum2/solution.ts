export function sum(a: number, b: number, c: number): number {
  return a + b + c;
}

export function x2(a: number, b: number): number {
  return a + b;
}

export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

export function curry2(fn) {
  const argsForFn = [];

  return function curried(...args) {
    argsForFn.push(...args);

    if (argsForFn.length >= fn.length) {
      return fn(...argsForFn);
    }
    return curried;
  };
}

console.log(curry(sum)(1, 2, 3)); // 6
console.log(curry(sum)(1, 2)(3)); // 6
console.log(curry(sum)(1)(2)(3)); // 6

console.log(curry(x2)(5, 7)); // 12
console.log(curry(x2)(5)(7)); // 12