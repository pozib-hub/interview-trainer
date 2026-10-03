export function squareSort(arr: number[]) {
  const n = arr.length;
  const out: number[] = new Array(n);
  let left = 0, right = n - 1, pos = n - 1;
  while (left <= right) {
    const ls = arr[left] * arr[left];
    const rs = arr[right] * arr[right];
    if (ls > rs) {
      out[pos--] = ls;
      left++;
    } else {
      out[pos--] = rs;
      right--;
    }
  }
  return out;
}
