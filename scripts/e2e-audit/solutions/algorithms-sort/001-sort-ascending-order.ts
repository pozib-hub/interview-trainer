export const sortAscendingOrder = (arr: number[]) => {
  const evens = arr.filter((x) => x % 2 === 0).sort((a, b) => a - b);
  let i = 0;
  return arr.map((x) => (x % 2 === 0 ? evens[i++] : x));
};
export const arr = [1, 8, 3, 9, 12, 13, 2, 5, 6];
