export function heapify(arr: number[], n: number, i: number) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}
export function heapSort(arr: number[]): number[] {
  const out = [...arr];
  const n = out.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(out, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [out[0], out[i]] = [out[i], out[0]];
    heapify(out, i, 0);
  }
  return out;
}
