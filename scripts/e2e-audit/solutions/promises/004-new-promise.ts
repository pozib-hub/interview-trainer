export function noop() {}

export function getThen(obj: any) {
  return obj.then;
}

export function tryCallOne(fn: Function, a: any) {
  try {
    return fn(a);
  } catch {
    return null;
  }
}

export function tryCallTwo(fn: Function, a: any, b: any) {
  try {
    fn(a, b);
  } catch {
    return null;
  }
}

export class Handler {
  onFulfilled: Function | null;
  onRejected: Function | null;
  promise: MyPromise;
  constructor(onFulfilled: any, onRejected: any, promise: MyPromise) {
    this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
    this.onRejected = typeof onRejected === "function" ? onRejected : null;
    this.promise = promise;
  }
}

export function resolve(self: MyPromise, newValue: any) {
  if (newValue === self) {
    return reject(self, new TypeError("Chaining cycle detected"));
  }
  if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
    const then = getThen(newValue);
    if (typeof then === "function") {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self.state = 1;
  self.value = newValue;
  finale(self);
}

export function reject(self: MyPromise, newValue: any) {
  self.state = 2;
  self.value = newValue;
  finale(self);
}

export function finale(self: MyPromise) {
  const deferreds = self.deferreds;
  self.deferreds = [];
  for (const deferred of deferreds) {
    handle(self, deferred);
  }
}

export function handle(self: MyPromise, deferred: Handler) {
  if (self.state === 0) {
    self.deferreds.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

export function handleResolved(self: MyPromise, deferred: Handler) {
  const cb = self.state === 1 ? deferred.onFulfilled : deferred.onRejected;
  if (cb === null) {
    if (self.state === 1) {
      resolve(deferred.promise, self.value);
    } else {
      reject(deferred.promise, self.value);
    }
    return;
  }
  let res: any;
  try {
    res = cb(self.value);
  } catch (err) {
    reject(deferred.promise, err);
    return;
  }
  resolve(deferred.promise, res);
}

export function safeThen(self: MyPromise, onFulfilled: any, onRejected: any) {
  const ret = new MyPromise(noop);
  const handler = new Handler(onFulfilled, onRejected, ret);
  handle(self, handler);
  return ret;
}

export function doResolve(fn: Function, promise: MyPromise) {
  let done = false;
  try {
    fn(
      (value: any) => {
        if (done) return;
        done = true;
        resolve(promise, value);
      },
      (reason: any) => {
        if (done) return;
        done = true;
        reject(promise, reason);
      }
    );
  } catch (ex) {
    if (done) return;
    done = true;
    reject(promise, ex);
  }
}

export class MyPromise {
  state: 0 | 1 | 2 = 0;
  value: any;
  deferreds: Handler[] = [];

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      noop();
      return;
    }
    doResolve(fn, this);
  }

  then(onFulfilled?: any, onRejected?: any) {
    return safeThen(this, onFulfilled, onRejected);
  }
}

export const Promise = MyPromise;
