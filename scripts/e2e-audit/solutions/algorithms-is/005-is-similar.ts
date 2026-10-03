export function isSimilar(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort((a, b) => a - b);
  const sorted2 = [...arr2].sort((a, b) => a - b);
  return sorted1.every((v, i) => v === sorted2[i]);
}
export function isSimilar3(arr1: number[], arr2: number[]) {
  return isSimilar(arr1, arr2);
}
export const isSimilar2 = (a: number[], b: number[]) => {
  return isSimilar(a, b);
};
