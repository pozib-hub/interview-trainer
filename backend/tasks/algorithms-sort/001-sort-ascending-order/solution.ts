export const arr = [1, 8, 3, 9, 12, 13, 2, 5, 6];

export const sortAscendingOrder = (arr: number[]) => {
  const result: number[] = [...arr];

  const onlyAscending = arr.filter((item) => item % 2 == 0);

  const sortedOnlyAscending = onlyAscending.sort((a, b) => b - a);

  for (let i = 0; i < result.length; i++) {
    const item = result[i];

    if (item % 2 === 0) {
      const itemAscending = sortedOnlyAscending.pop()!;
      result[i] = itemAscending;
    }
  }

  return result;
};

console.log(sortAscendingOrder(arr));