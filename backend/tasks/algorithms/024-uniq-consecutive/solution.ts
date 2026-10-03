export function func(subsequence: string | string[] | number[]) {
  const result: string[] | number[] = [];

  for (let i = 0; i < subsequence.length; i++) {
    const curItem = subsequence[i];
    const nextItem = subsequence[i + 1];

    if (nextItem !== curItem) {
      result.push(curItem);
    }
  }

  return result;
}