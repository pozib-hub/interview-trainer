declare global {
  interface Array<T> {
    flatRecurs<U = T>(depth: number): U[];
    flatStack<U = T>(depth: number): U[];
  }
}

export const example = undefined as any;
