export function selectionSort(arr: number[]): number[] {
  const out = [...arr];
  for (let i = 0; i < out.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < out.length; j++) {
      if (out[j] < out[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [out[i], out[minIdx]] = [out[minIdx], out[i]];
  }
  return out;
}
