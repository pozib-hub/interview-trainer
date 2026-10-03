export function cleanObject<T extends object>(
  obj: T
): { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] } {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      out[key] = value;
    }
  }
  return out as any;
}
