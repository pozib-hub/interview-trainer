declare global {
  interface Function {
    myBind<T extends any[]>(
      this: (...args: T) => void,
      context: object,
      ...boundArgs: any[]
    ): (...args: any[]) => void;
  }
}

export function getResult(): boolean {
  // TODO: реализуйте
  return undefined as any;
}

export {};
