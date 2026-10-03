export function testThisBinding() {
  const obj = { name: "Test" };
  const getName = function (this: { name: string }) {
    return this.name;
  };
  const name = "arrow";
  const arrowObj = { arrow: () => name };
  return {
    methodCall: getName.call(obj),
    unboundCall: getName.call(obj),
    boundCall: getName.bind(obj)(),
    applyCall: getName.apply(obj),
    arrowCall: arrowObj.arrow(),
  };
}

export function testNewThis() {
  let count = 0;
  function Widget(this: unknown) {
    count++;
  }
  Widget.prototype.method = function () {
    return "exists";
  };
  const w1 = new (Widget as any)();
  const w2 = new (Widget as any)();
  return {
    constructorThis: count === 2,
    prototypeMethod: typeof w1.method === "function" ? "exists" : "missing",
  };
}
