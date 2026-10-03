declare global {
  interface Array<T> {
    myFilter<U extends T>(predicate: (value: T, index: number, array: T[]) => unknown): U[];
  }
}

// TODO: реализуйте myFilter

export {};
