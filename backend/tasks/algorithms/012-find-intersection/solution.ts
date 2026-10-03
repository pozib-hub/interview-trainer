// O(n + m) по времени    O(m) по памяти (так как создаем Set).
export function findIntersection(arr1: number[], arr2: number[]) {
  const set2 = new Set(arr2);

  const result = [];

  for (let num1 of arr1) {
    if (set2.has(num1)) {
      result.push(num1);
      set2.delete(num1);
    }
  }
  return result;
}

// O(n + m) по времени    O(m) по памяти (так как создаем Set).
export const findIntersection2 = (arr1: number[], arr2: number[]): number[] => {
  const set2 = new Set(arr2);
  return arr1.filter((num) => {
    if (set2.has(num)) {
      set2.delete(num);
      return true;
    }
    return false;
  });
};
