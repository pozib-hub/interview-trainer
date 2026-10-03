export function testThisBinding(): {
  methodCall: string;
  unboundCall: string | undefined;
  boundCall: string;
  applyCall: string;
  arrowCall: string;
} {
  const name = "Test";

  function getName(this: { name: string }) {
    return this.name;
  }

  const obj = {
    name: name,
    getName: getName,
    arrow: () => "arrow",
  };

  const unbound = obj.getName;

  return {
    methodCall: obj.getName(),
    unboundCall: unbound.call(obj),
    boundCall: obj.getName.bind(obj)(),
    applyCall: obj.getName.apply(obj),
    arrowCall: obj.arrow(),
  };
}

export function testNewThis(): { constructorThis: boolean; prototypeMethod: string } {
  class Counter {
    count = 0;

    increment() {
      this.count++;
      return this.count;
    }
  }

  const counter = new Counter();
  counter.increment();
  counter.increment();

  return {
    constructorThis: counter.count === 2,
    prototypeMethod: typeof Counter.prototype.increment === "function" ? "exists" : "missing",
  };
}
