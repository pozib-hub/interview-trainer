declare global {
  interface Array<T> {
    upperBound(target: number): number;
  }
}

Array.prototype.upperBound = function (target: number): number {
  let left = 0;
  let right = this.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (this[mid] > target) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left > 0 && this[left - 1] === target ? left - 1 : -1;
};

export {};
