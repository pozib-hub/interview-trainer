export const merge = (a: number[], b: number[]): number[] => {
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
};
export const a = [1, 3, 5, 7, 7, 9];
export const b = [2, 3, 3, 6, 7, 8, 10, 12, 14];
