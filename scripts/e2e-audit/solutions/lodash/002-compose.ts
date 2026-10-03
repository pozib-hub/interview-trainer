export const square = (x: number) => {
  return x * x;
};
export const times2 = (x: number) => {
  return x * 2;
};
export const sum = (a: number, b: number) => {
  return a + b;
};
export type Fn<T, R> = (...args: T[]) => R;

export const compose1 = (...fns: Fn<any, any>[]) => {
  return (...args: any[]) => {
    let result = fns[fns.length - 1](...args);
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i](result);
    }
    return result;
  };
};

export const compose2 = (...fns: Fn<any, any>[]) => {
  if (fns.length === 0) return () => 0;
  return compose1(...fns);
};
