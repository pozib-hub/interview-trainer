export function shellSort(arr: number[]): number[] {
  const out = [...arr];
  let gap = Math.floor(out.length / 2);
  while (gap > 0) {
    for (let i = gap; i < out.length; i++) {
      const key = out[i];
      let j = i;
      while (j >= gap && out[j - gap] > key) {
        out[j] = out[j - gap];
        j -= gap;
      }
      out[j] = key;
    }
    gap = Math.floor(gap / 2);
  }
  return out;
}
