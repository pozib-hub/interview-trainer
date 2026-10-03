export function bubbleSort(arr: number[]): number[] {
  const out = [...arr];
  for (let i = 0; i < out.length; i++) {
    for (let j = 0; j < out.length - 1 - i; j++) {
      if (out[j] > out[j + 1]) {
        [out[j], out[j + 1]] = [out[j + 1], out[j]];
      }
    }
  }
  return out;
}
