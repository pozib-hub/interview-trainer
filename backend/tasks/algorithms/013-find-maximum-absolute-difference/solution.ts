export function findMaximumAbsoluteDifference(arr: number[]): number {
  if (arr.length < 2) {
    throw new Error("Массив должен содержать хотя бы 2 числа");
  }

  const min = Math.min(...arr);
  const max = Math.max(...arr);

  return Math.abs(max - min);
}

export function findMaximumAbsoluteDifference2(arr: number[]): number {
  if (arr.length < 2) {
    throw new Error("Массив должен содержать хотя бы 2 числа");
  }

  let min = arr[0];
  let max = arr[0];

  for (const num of arr) {
    if (num < min) min = num;
    if (num > max) max = num;
  }

  return Math.abs(max - min);
}