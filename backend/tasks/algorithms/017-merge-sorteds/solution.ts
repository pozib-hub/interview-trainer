export const merge = (a: number[], b: number[]): number[] => {
  let i = 0;
  let j = 0;
  const result: number[] = [];

  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) {
      result.push(a[i]);
      i++;
    } else {
      result.push(b[j]);
      j++;
    }
  }

  // Добавляем оставшиеся элементы из a
  while (i < a.length) {
    result.push(a[i]);
    i++;
  }

  // Добавляем оставшиеся элементы из b
  while (j < b.length) {
    result.push(b[j]);
    j++;
  }

  return result;
};

// Тест
export const a = [1, 3, 5, 7, 7, 9];
export const b = [2, 3, 3, 6, 7, 8, 10, 12, 14];

console.log(merge(a, b));