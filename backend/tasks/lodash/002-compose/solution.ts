export const square = (x: number) => x * x;
export const times2 = (x: number) => x * 2;

export const sum = (a: number, b: number) => a + b;

export type Fn<T, R> = (...args: T[]) => R;

export const compose1 = <T, R>(...fnc: Fn<any, any>[]): ((...args: T[]) => R) => {
  return function (...args: T[]): R {
    return fnc.reduceRight((acc, fn) => {
      if (Array.isArray(acc)) {
        return fn(...acc); // передаем массив как аргументы функции
      } else {
        return fn(acc); // передаем одиночный аргумент
      }
    }, args) as R;
  };
};

export const compose2 = <T, R>(...fns: Fn<any, any>[]): ((...args: T[]) => R) => {
  return function (...args: T[]): R {
    if (!fns.length) {
      return 0 as R;
    }

    let result = Array.isArray(args)
      ? fns[fns.length - 1](...args)
      : fns[fns.length - 1](args);

    for (let i = fns.length - 2; i >= 0; i--) {
      const fn = fns[i];
      result = fn(result);
    }

    return result;
  };
};

console.log(compose1(square, times2)(2) === square(times2(2)));
console.log(compose2(square, times2, sum)(3, 4) === square(times2(sum(3, 4))));