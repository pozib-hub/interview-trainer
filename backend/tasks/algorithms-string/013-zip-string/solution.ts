export const fn = (str: string): string[][] => {
  const result: string[][] = [];

  const words = str.split(" ");
  const lengthStr = words.map((word) => word.length);
  // находим максимальную длину из всех слов
  const maxLengthStr = Math.max(...lengthStr);

  // теперь просто по максимальной длине проходим
  for (let i = 0; i < maxLengthStr; i++) {
    // и итеративно берем по каждой букве из слов
    const row: string[] = words.map((word) => word[i] || "");
    result.push(row);
  }

  return result;
};

console.log(fn("желтый банан"));
console.log(fn("теперь зеленый банан"));