declare global {
  interface Array<T> {
    upperBound(target: number): number;
  }
}

Array.prototype.upperBound = function (target: number): number {
  let lo = 0;
  let hi = this.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const val = this[mid] as number;
    if (val === target) {
      result = mid;
      lo = mid + 1;
    } else if (val < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
};

export {};
