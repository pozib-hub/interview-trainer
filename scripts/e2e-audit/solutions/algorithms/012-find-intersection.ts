export function findIntersection(arr1: number[], arr2: number[]) {
  const set2 = new Set(arr2);
  return arr1.filter((x) => {
    if (set2.has(x)) {
      set2.delete(x);
      return true;
    }
    return false;
  });
}
export const findIntersection2 = (arr1: number[], arr2: number[]): number[] => {
  return findIntersection(arr1, arr2);
};
