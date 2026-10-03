export function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return [...arr];
  const pivot = arr[arr.length - 1];
  const less: number[] = [];
  const equal: number[] = [];
  const greater: number[] = [];
  for (const x of arr) {
    if (x < pivot) less.push(x);
    else if (x === pivot) equal.push(x);
    else greater.push(x);
  }
  return [...quickSort(less), ...equal, ...quickSort(greater)];
}
