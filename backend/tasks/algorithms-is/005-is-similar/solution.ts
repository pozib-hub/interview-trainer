// O(n) Работает корректно только если все элементы уникальны.
export function isSimilar(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const hash = new Set(arr2);

  return arr1.every((item) => hash.has(item));
}

// O(n log n)
export const isSimilar2 = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

// O(n)
export function isSimilar3(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) return false;

  const freq1 = new Map<number, number>();
  const freq2 = new Map<number, number>();

  for (const n of arr1) {
    const itemFreq1 = freq1.get(n);
    freq1.set(n, itemFreq1 ? itemFreq1 + 1 : 1);

    // freq1.set(n, (freq1.get(n) ?? 0) + 1);
  }

  for (const n of arr2) {
    const itemFreq2 = freq2.get(n);
    freq2.set(n, itemFreq2 ? itemFreq2 + 1 : 1);

    // freq2.set(n, (freq2.get(n) ?? 0) + 1);
  }

  for (const [key, val] of freq1) {
    if (freq2.get(key) !== val) {
      return false;
    }
  }

  return true;
}