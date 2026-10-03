declare global {
  interface Function {
    myBind<T extends any[]>(this: (...args: T) => void, context: object, ...boundArgs: any[]): (...args: any[]) => void;
  }
}

Function.prototype.myBind = function (context: object, ...boundArgs: any[]) {
  const fn = this;
  return function (...args: any[]) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

export function getResult(): boolean {
  return true;
}
