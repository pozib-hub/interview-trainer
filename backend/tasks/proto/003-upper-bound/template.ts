declare global {
  interface Array<T> {
    upperBound(target: number): number;
  }
}

// TODO: реализуйте — назначьте метод upperBound на Array.prototype
Array.prototype.upperBound = function (target: number): number {
  return -1;
};

export {};
