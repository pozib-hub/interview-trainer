export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  cb: (item: T) => K
): Record<K, T[]> {
  return array.reduce<Record<K, T[]>>((acc, element) => {
    const key = cb(element);
    if (acc[key]) {
      acc[key].push(element);
    } else {
      acc[key] = [element];
    }
    return acc;
  }, {} as Record<K, T[]>);
}
