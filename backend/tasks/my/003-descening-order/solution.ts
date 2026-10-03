export function descendingOrder(n: number): number {
  return parseInt(
    n
      .toString()
      .split("")
      .sort((a, b) => Number(b) - Number(a))
      .join(""),
    10
  );
}

console.log(descendingOrder(0) === 0);
console.log(descendingOrder(1) === 1);
console.log(descendingOrder(111) === 111);
console.log(descendingOrder(15) === 51);
console.log(descendingOrder(1021) === 2110);
console.log(descendingOrder(123456789) === 987654321);