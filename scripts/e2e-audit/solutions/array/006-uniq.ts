export function uniq<T>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const key = typeof item === "object" && item !== null ? JSON.stringify(item) : String(item) + "|" + typeof item;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
export function uniq2<T>(arr: T[]): T[] {
  return uniq(arr);
}
