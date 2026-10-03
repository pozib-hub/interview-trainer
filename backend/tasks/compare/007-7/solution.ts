export function compareValues(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (typeof a === "number" && typeof b === "number") {
    return Object.is(a, b);
  }

  if (typeof a === "string" && typeof b === "string") {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => compareValues(item, b[i]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      compareValues((a as any)[key], (b as any)[key])
    );
  }

  return false;
}
