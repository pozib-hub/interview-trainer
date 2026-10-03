Array.prototype.forEach = function (
  callback: (value: any, index: number, array: any[]) => void,
  context?: any
): void {
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      callback.call(context, this[i], i, this);
    }
  }
};

export {};
