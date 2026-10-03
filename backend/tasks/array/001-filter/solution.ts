declare global {
  interface Array<T> {
    myFilter<U extends T>(predicate: (value: T, index: number, array: T[]) => unknown): U[];
  }
}

Array.prototype.myFilter = function <T>(predicate: (value: T, index: number, array: T[]) => unknown): T[] {
  const result: T[] = [];
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

export {};
