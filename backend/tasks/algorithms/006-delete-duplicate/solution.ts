export function deleteDuplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function deleteDuplicate2<T>(arr: T[]): T[] {
  const dict: Record<string, number> = {};
  for (let num of arr) {
    dict[num as any] = dict[num as any] ? dict[num as any] + 1 : 0;
  }
  return Object.keys(dict).map((key) => Number(key));
}
