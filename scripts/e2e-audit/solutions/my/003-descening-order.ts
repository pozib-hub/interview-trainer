export function descendingOrder(n: number): number {
  return Number(String(n).split("").sort((a, b) => (b > a ? 1 : -1)).join(""));
}
