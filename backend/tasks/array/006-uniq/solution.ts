export function uniq<T>(arr: T[]): T[] {
  return arr.filter((item, index, self) =>
    typeof item === "object"
      ? index === self.findIndex((obj) => JSON.stringify(obj) === JSON.stringify(item))
      : self.indexOf(item) === index
  );
}

export function uniq2<T>(arr: T[]): T[] {
  const seen = new Map<string, T>();
  return arr.filter((item) => {
    const key = typeof item === "object" && item !== null ? JSON.stringify(item) : String(item);
    if (!seen.has(key)) {
      seen.set(key, item);
      return true;
    }
    return false;
  });
}
