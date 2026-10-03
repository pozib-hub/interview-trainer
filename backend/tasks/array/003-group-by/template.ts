export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  cb: (item: T) => K
): Record<K, T[]> {
  // TODO: реализуйте groupBy
  return {} as Record<K, T[]>;
}
