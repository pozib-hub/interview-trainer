export function insertionSort(arr: number[]): number[] {
  const out = [...arr];
  for (let i = 1; i < out.length; i++) {
    const key = out[i];
    let j = i - 1;
    while (j >= 0 && out[j] > key) {
      out[j + 1] = out[j];
      j--;
    }
    out[j + 1] = key;
  }
  return out;
}
