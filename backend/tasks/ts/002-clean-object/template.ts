export function cleanObject<T extends object>(
  obj: T
): { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] } {
  // TODO: реализуйте cleanObject
  return undefined as any;
}
