export const times = (y: number) => {
  return (x: number) => x * y;
};
export const plus = (y: number) => {
  return (x: number) => x + y;
};
export const subtract = (y: number) => {
  return (x: number) => x - y;
};
export const divide = (y: number) => {
  return (x: number) => x / y;
};

function pipe(fns: ((x: number) => number)[]) {
  return (x: number) => {
    let result = x;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}

export const calculationOne = pipe([times(2), times(3)]);
export const calculationTwo = pipe([times(7), plus(14)]);
