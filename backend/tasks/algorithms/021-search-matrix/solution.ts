// Нужное решение через бинарный поиск
export function matrix(array: number[][], target: number) {
  const rowIndex = findRow(array, target);

  if (rowIndex < 0) {
    return false;
  }

  return findNumInRow(array[rowIndex], target);
}

export function findRow(matrix: number[][], target: number) {
  let left = 0;
  let right = matrix.length - 1;

  while (left <= right) {
    let middleIndex = Math.floor((left + right) / 2);
    let array = matrix[middleIndex];
    let startArr = array[0];
    let endArr = array[array.length - 1];

    if (startArr <= target && target <= endArr) {
      return middleIndex;
    }

    if (startArr === target || endArr === target) {
      return middleIndex;
    }

    if (startArr < target) {
      left = middleIndex + 1;
    } else {
      right = middleIndex - 1;
    }
  }

  return -1;
}

export function findNumInRow(array: number[], target: number): boolean {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const middleIndex = Math.floor((left + right) / 2);

    if (array[middleIndex] === target) {
      return true;
    }
    if (array[middleIndex] < target) {
      left = middleIndex + 1;
    }

    if (array[middleIndex] > target) {
      right = middleIndex - 1;
    }
  }

  return false;
}

// prettier-ignore
console.log(matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3)); // true

// prettier-ignore
console.log(matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13)); // false
console.log(matrix([[1, 3, 5, 7]], 7)); // true (одна строка)
console.log(matrix([[1], [3], [5], [7]], 5)); // true (один столбец)

console.log(matrix([], 5)); // false (пустая матрица)
console.log(matrix([[]], 5)); // false (матрица с пустыми строками)
console.log(matrix([[1]], 1)); // true (матрица 1x1)
console.log(matrix([[1]], 2)); // false (матрица 1x1, числа нет)

// prettier-ignore
console.log(matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1)); // true (первый элемент)

// prettier-ignore
console.log(matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 9)); // true (последний элемент)

// prettier-ignore
console.log(matrix([[1, 2, 3],[4, 5, 6],[7, 8, 9]], 10)); // false (числа нет)

// prettier-ignore
console.log(matrix([[1, 4, 7],[10, 13, 16],[19, 22, 25]], 13)); // true (вторая строка)

// prettier-ignore
console.log(matrix([[1, 4, 7],  [10, 13, 16], [19, 22, 25]], 22)); // true (третья строка)

// prettier-ignore
console.log(matrix([[1, 4, 7], [10, 13, 16],[19, 22, 25]], 5)); // false (числа нет)

export const largeMatrix = Array.from({ length: 1000 }, (_, i) =>
  Array.from({ length: 1000 }, (_, j) => i * 1000 + j + 1)
); // 1000x1000 матрица с числами 1...1_000_000

console.log(matrix(largeMatrix, 500000)); // true (середина)
console.log(matrix(largeMatrix, 1000000)); // true (последний элемент)
console.log(matrix(largeMatrix, 1000001)); // false (числа нет)

//Решение подходит для сложности по времени, но не подходит если нельзя использовать дополнительную память
export function flat(array: number[][]): number[] {
  const result: number[] = [];

  array.forEach((item) => {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  });

  return result;
}

export function matrix2(array: number[][], target: number) {
  const flattedArr = flat(array); // ->  [1,3,5,7,10,11,16,20,23,30,34,60]

  let middleIndex = Math.floor(flattedArr.length / 2);
  while (middleIndex > 0 && middleIndex < flattedArr.length - 1) {
    const middleItem = flattedArr[middleIndex];

    if (target === middleItem) {
      return true;
    }

    if (target > middleItem) {
      middleIndex = Math.floor(middleIndex + middleIndex / 2);
    } else {
      middleIndex = Math.floor(middleIndex / 2);
    }
  }

  return false;
}