export function sum(a: number = 0) {
  if (!a) {
    return 0;
  }

  return function (b?: number) {
    if (b === undefined) {
      return a;
    }

    return sum(a + b);
  };
}

console.log(sum());
console.log(sum(1)());
console.log(sum(1)(4)());
console.log(sum(5)(2)(2)());
console.log(sum(9)(5)(1)(5)(4)(6)());