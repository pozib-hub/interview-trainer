export function findMin(arr: number[]): number {
  let min = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
    }
  }

  return min;
}

export function findMax(arr: number[]): number {
  let max = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }

  return max;
}

console.log(findMin([5, 2, 8, 1, 4])); // 1
console.log(findMax([5, 2, 8, 1, 4])); // 8