export function descendingOrder(n: number): number {
  return parseInt(
    n.toString().split("").sort((a, b) => Number(b) - Number(a)).join(""),
    10
  );
}
