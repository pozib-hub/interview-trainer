export function digitPermutation(arr: number[]) {
  const groups = new Map<string, number[]>();
  for (const n of arr) {
    const key = String(n).replace(/0/g, "").split("").sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }
  return [...groups.values()];
}
export function digitPermutation2(arr: number[]) {
  return digitPermutation(arr);
}
