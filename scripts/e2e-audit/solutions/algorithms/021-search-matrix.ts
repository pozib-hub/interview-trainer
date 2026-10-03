export function matrix(array: number[][], target: number) {
  return array.some((row) => row.includes(target));
}
export function findRow(matrix: number[][], target: number) {
  for (const row of matrix) {
    if (row.length && target >= row[0] && target <= row[row.length - 1]) return row;
  }
  return undefined;
}
export function findNumInRow(array: number[], target: number): boolean {
  let lo = 0, hi = array.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (array[mid] === target) return true;
    if (array[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
export function flat(array: number[][]): number[] {
  return array.reduce<number[]>((acc, row) => acc.concat(row), []);
}
export function matrix2(array: number[][], target: number) {
  const flatArr = flat(array);
  return findNumInRow(flatArr, target);
}
export const largeMatrix = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];
