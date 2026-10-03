declare global {
  interface Array<T> {
    myReduce<U>(callback: (accumulator: U, current: T, index: number, array: T[]) => U, initialValue: U): U;
  }
}

Array.prototype.myReduce = function <T, U>(
  this: T[],
  callback: (accumulator: U, current: T, index: number, array: T[]) => U,
  initialValue: U
): U {
  let acc = initialValue;
  for (let i = 0; i < this.length; i++) {
    acc = callback(acc, this[i], i, this);
  }
  return acc;
};

export {};
