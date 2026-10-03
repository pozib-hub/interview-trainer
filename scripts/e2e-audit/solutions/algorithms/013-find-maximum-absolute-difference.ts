export function findMaximumAbsoluteDifference(arr: number[]): number {
  if (arr.length < 2) throw new Error("need at least 2 elements");
  let min = arr[0], max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return Math.abs(max - min);
}
export function findMaximumAbsoluteDifference2(arr: number[]): number {
  if (arr.length < 2) throw new Error("need at least 2 elements");
  let min = arr[0], max = arr[0];
  for (const x of arr) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return Math.abs(max - min);
}
