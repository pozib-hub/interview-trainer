export function squareSort(arr: number[]) {
  const result = new Array(arr.length);

  let left = 0;
  let right = arr.length - 1;

  for (let i = arr.length - 1; i >= 0; i--) {
    const leftValue = arr[left] ** 2;
    const rightValue = arr[right] ** 2;

    // 4 > 100
    if (leftValue > rightValue) {
      result[i] = leftValue;
      left++;
    } else {
      result[i] = rightValue;
      right--;
    }
  }

  return result;
}

console.log(squareSort([1, 2, 3, 4, 5])); // -> [1, 4, 9, 16, 25]


console.log(squareSort([-4, -1, 0, 3, 10])); // -> [0, 1, 4, 9, 100]