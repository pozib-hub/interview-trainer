export function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const counts = new Array(max - min + 1).fill(0);
  for (const x of arr) counts[x - min]++;
  const out: number[] = [];
  for (let v = min; v <= max; v++) {
    for (let c = 0; c < counts[v - min]; c++) out.push(v);
  }
  return out;
}
