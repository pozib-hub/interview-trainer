declare global {
  interface Array<T> {
    myReduce<U>(callback: (accumulator: U, current: T, index: number, array: T[]) => U, initialValue: U): U;
  }
}

// TODO: реализуйте myReduce

export {};
