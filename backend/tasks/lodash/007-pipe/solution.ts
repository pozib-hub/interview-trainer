export const times = (y: number) => (x: number) => x * y;
export const plus = (y: number) => (x: number) => x + y;
export const subtract = (y: number) => (x: number) => x - y;
export const divide = (y: number) => (x: number) => x / y;

export function pipe(fns: ((x: number) => number)[]) {
  return function (int: number) {
    if (!fns.length) return 0;

    const firstResultFn = fns[0](int);

    let result = firstResultFn;

    for (let i = 1; i < fns.length; i++) {
      const fn = fns[i];
      result = fn(result);
    }
    return result;
  };
}

export function pipe2(fns: ((x: number) => number)[]) {
  return function (int: number) {
    return fns.reduce((acc, fn) => {
      return fn(acc);
    }, int);
  };
}

export const calculationOne = pipe([times(2), times(3)]); // -> (2 * 2) -> * 3

console.log(calculationOne(2)); // 12

export const calculationTwo = pipe([times(2), plus(3), times(4)]); // -> (2 * 2) -> + 3 -> * 4

console.log(calculationTwo(2)); // 28