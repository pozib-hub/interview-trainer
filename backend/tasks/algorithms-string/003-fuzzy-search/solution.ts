export const fuzzySearch = (word: string, query: string): boolean => {
  let index = 0;

  for (const char of word) {
    if (char === query[index]) {
      index++;
    }
    if (index === query.length) return true;
  }

  return false;
};

// Проверяем примеры из задачи:
console.log(fuzzySearch("крокодил", "кроко")); // true
console.log(fuzzySearch("крокодил", "кдил")); // true
console.log(fuzzySearch("крокодил", "ид")); // false