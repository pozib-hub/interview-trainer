export function toCamelCase(subsequence: string) {
  const words = subsequence.split(/[-_]/);
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}
export function toCamelCase2(str: string): string {
  return toCamelCase(str);
}
