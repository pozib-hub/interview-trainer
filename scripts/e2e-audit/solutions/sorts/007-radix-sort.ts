export function countingSortByDigit(arr: number[], digitPlace: number) {
  const counts = new Array(10).fill(0);
  for (const x of arr) {
    counts[Math.floor(x / digitPlace) % 10]++;
  }
  for (let d = 1; d < 10; d++) counts[d] += counts[d - 1];
  const out: number[] = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {
    const d = Math.floor(arr[i] / digitPlace) % 10;
    out[--counts[d]] = arr[i];
  }
  return out;
}
export function radixSort(arr: number[]): number[] {
  let out = [...arr];
  if (out.length === 0) return out;
  const max = Math.max(...out);
  for (let digitPlace = 1; Math.floor(max / digitPlace) > 0; digitPlace *= 10) {
    out = countingSortByDigit(out, digitPlace);
  }
  return out;
}
