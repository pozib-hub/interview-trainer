declare global {
  interface Function {
    delay(ms: number): (...args: any[]) => void;
  }
}

Function.prototype.delay = function (ms: number): (...args: any[]) => void {
  const fn = this;
  return function (...args: any[]) {
    setTimeout(() => fn.apply(this, args), ms);
  };
};

export function getResult(): boolean {
  return true;
}
