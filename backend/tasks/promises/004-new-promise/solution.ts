export function noop() {}

export function getThen(obj: any) {
  try {
    return obj.then;
  } catch (ex) {
    return null;
  }
}

export function tryCallOne(fn: Function, a: any) {
  try {
    return fn(a);
  } catch (ex) {
    return null;
  }
}

export function tryCallTwo(fn: Function, a: any, b: any) {
  try {
    fn(a, b);
  } catch (ex) {
    return null;
  }
}

export class Handler {
  onFulfilled: Function | null;
  onRejected: Function | null;
  promise: any;

  constructor(onFulfilled: any, onRejected: any, promise: any) {
    this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
    this.onRejected = typeof onRejected === "function" ? onRejected : null;
    this.promise = promise;
  }
}

export class MyPromise {
  _state: number = 0;
  _value: any = null;
  _deferreds: any[] = [];

  constructor(fn: Function) {
    if (typeof fn !== "function") {
      throw new TypeError("Promise constructor's argument is not a function");
    }
    this._state = 0;
    this._value = null;
    this._deferreds = [];
    if (fn === noop) return;
    doResolve(fn, this);
  }

  then(onFulfilled: any, onRejected: any) {
    const res = new MyPromise(noop);
    handle(this, new Handler(onFulfilled, onRejected, res));
    return res;
  }
}

export function safeThen(self: MyPromise, onFulfilled: any, onRejected: any) {
  return new MyPromise(function (resolve: any, reject: any) {
    var res = new MyPromise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}

export function handle(self: MyPromise, deferred: Handler) {
  if (self._state === 0) {
    self._deferreds.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

export function handleResolved(self: MyPromise, deferred: Handler) {
  setTimeout(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._state === 1) {
        resolve(deferred.promise, self._value);
      } else {
        reject(deferred.promise, self._value);
      }
      return;
    }
    var ret = tryCallOne(cb, self._value);
    if (ret === null) {
      reject(deferred.promise, new Error("callback threw"));
    } else {
      resolve(deferred.promise, ret);
    }
  }, 0);
}

export function resolve(self: MyPromise, newValue: any) {
  if (newValue === self) {
    return reject(self, new TypeError("A promise cannot be resolved with itself."));
  }
  if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
    var then = getThen(newValue);
    if (then === self.then && newValue instanceof MyPromise) {
      self._state = 3;
      self._value = newValue;
      finale(self);
      return;
    } else if (typeof then === "function") {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._state = 1;
  self._value = newValue;
  finale(self);
}

export function reject(self: MyPromise, newValue: any) {
  self._state = 2;
  self._value = newValue;
  finale(self);
}

export function finale(self: MyPromise) {
  for (var i = 0; i < self._deferreds.length; i++) {
    handle(self, self._deferreds[i]);
  }
  self._deferreds = [];
}

export function doResolve(fn: Function, promise: MyPromise) {
  var done = false;
  tryCallTwo(
    fn,
    function (value: any) {
      if (done) return;
      done = true;
      resolve(promise, value);
    },
    function (reason: any) {
      if (done) return;
      done = true;
      reject(promise, reason);
    }
  );
}
