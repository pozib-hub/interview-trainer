export const func = (arr: number[], arr2: number[]) => {
  const setArr2 = new Set(arr2); // Используем Set для быстрого поиска
  return arr.filter((item) => !setArr2.has(item)); // Фильтруем, удаляя элементы, которые есть в setArr2
};
export const func2 = (arr: number[], arr2: number[]) => {
  return arr.filter((item) => !arr2.includes(item));
};

// ПРИМЕР:
console.log(func([0, 2, 2, 2, 4], [2])); // [0,4]
console.log(func([1, 2, 3], [])); // [1, 2, 3]
console.log(func([1, 2, 3], [1, 2])); // [3]