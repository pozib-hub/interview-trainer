export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEqualDeep(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isEqualDeep(a[key], b[key])) return false;
  }
  return true;
}

export const obj1 = { a: 1, b: { c: 2 } };
export const obj2 = { a: 1, b: { c: 2 } };
export const sym1 = Symbol("s");
export const sym2 = Symbol("s");
export const objA = obj1;
export const objB = obj2;
