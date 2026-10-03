declare global {
  interface Function {
    myBind<T extends any[]>(
      this: (...args: T) => void,
      context: object,
      ...boundArgs: any[]
    ): (...args: any[]) => void;
  }
}

Function.prototype.myBind = function (
  this: (...args: any[]) => any,
  context: object,
  ...boundArgs: any[]
) {
  const fn = this;
  return function (this: unknown, ...args: any[]) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

export function getResult(): boolean {
  return true;
}

export {};
