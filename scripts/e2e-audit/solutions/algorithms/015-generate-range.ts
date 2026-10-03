export function range(a: number, b: number): number[] {
  const step = a <= b ? 1 : -1;
  const out: number[] = [];
  for (let v = a; step > 0 ? v <= b : v >= b; v += step) out.push(v);
  return out;
}
export function range2(a: number, b: number): number[] {
  return range(a, b);
}
