declare global {
  interface Array<T> {
    myMap<U>(callback: (value: T, index: number, array: T[]) => U): U[];
  }
}

Array.prototype.myMap = function <T, U>(
  this: T[],
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  const out: U[] = [];
  for (let i = 0; i < this.length; i++) {
    out.push(callback(this[i], i, this));
  }
  return out;
};

export {};
