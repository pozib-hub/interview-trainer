declare global {
  interface Array<T> {
    myFilter<U extends T>(predicate: (value: T, index: number, array: T[]) => unknown): U[];
  }
}

Array.prototype.myFilter = function <T, U extends T>(
  this: T[],
  predicate: (value: T, index: number, array: T[]) => unknown
): U[] {
  const out: U[] = [];
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) {
      out.push(this[i] as unknown as U);
    }
  }
  return out;
};

export {};
