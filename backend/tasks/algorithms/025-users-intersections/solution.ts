// Простое решение (наивный подход) Время: O(n * m) Память: O(1)
export function intersection(user1: number[][], user2: number[][]) {
  const result: number[][] = [];

  for (let i = 0; i < user1.length; i++) {
    const [start1, end1] = user1[i];

    for (let j = 0; j < user2.length; j++) {
      const [start2, end2] = user2[j];

      const start = start1 > start2 ? start1 : start2;
      const end = end1 < end2 ? end1 : end2;
      // const start = Math.max(start1, start2);
      // const end = Math.min(end1, end2);

      if (start < end) {
        result.push([start, end]);
      }
    }
  }

  return result;
}

// Оптимальное решение (два указателя)  Время: O(n + m)  Память: O(1)
export function intersection2(user1: number[][], user2: number[][]) {
  const result: number[][] = [];

  let i = 0;
  let j = 0;

  while (i < user1.length && j < user2.length) {
    const [start1, end1] = user1[i];
    const [start2, end2] = user2[j];

    const start = start1 > start2 ? start1 : start2;
    const end = end1 < end2 ? end1 : end2;

    if (start < end) {
      result.push([start, end]);
    }

    if (end1 < end2) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}

// prettier-ignore
intersection(
  [[8, 12], [17, 22]],
  [[5, 11], [14, 18], [20, 23]]
) // => [[8, 11], [17, 18], [20, 22]]

// prettier-ignore
intersection(
  [[9, 15], [18, 21]],
  [[10, 14], [21, 22]]
) // => [[10, 14]]