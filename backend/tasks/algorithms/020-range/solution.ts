export function range(array: number[]): string {
  if (!array.length) {
    return "";
  }

  const sortedArray = [...new Set(array)].sort((a, b) => a - b);
  const result: string[] = [];

  let start = sortedArray[0];
  let prev = sortedArray[0];

  for (let i = 1; i <= sortedArray.length; i++) {
    const curr = sortedArray[i];

    if (curr - prev != 1) {
      // Если start и prev одинаковые, это одиночное число, иначе диапазон
      result.push(start === prev ? `${start}` : `${start}-${prev}`);

      // Начинаем новый диапазон
      start = curr;
    }

    prev = curr;
  }

  return result.join(",");
}

console.log(range([1, 4, 5, 2, 3, 9, 8, 11, 0])); // "0-5,8-9,11"
console.log(range([1, 4, 3, 2])); // "1-4"
console.log(range([10, 12, 11, 14, 15, 16])); // "10-12,14-16"
console.log(range([])); // ""
console.log(range([1, 2, 2, 3, 4, 6, 7, 9])); // "1-4,6-7,9"
console.log(range([1, 3, 5, 7, 9])); // "1,3,5,7,9"