export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  cb: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of array) {
    const key = cb(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}
