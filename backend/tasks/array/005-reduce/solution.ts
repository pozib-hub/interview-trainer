declare global {
  interface Array<T> {
    myReduce<U>(callback: (accumulator: U, current: T, index: number, array: T[]) => U, initialValue: U): U;
  }
}

Array.prototype.myReduce = function <T, U>(
  callback: (accumulator: U, current: T, index: number, array: T[]) => U,
  initialValue: U
): U {
  let accumulator = initialValue;
  for (let i = 0; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};

export {};
