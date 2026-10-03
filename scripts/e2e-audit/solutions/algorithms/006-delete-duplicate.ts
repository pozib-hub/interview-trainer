export function deleteDuplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
export function deleteDuplicate2<T>(arr: T[]): T[] {
  return arr.filter((x, i) => arr.indexOf(x) === i);
}
