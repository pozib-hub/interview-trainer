export function getLongestCommonPrefix(arr: string[]): string {
  if (arr.length === 0) return "";
  let prefix = arr[0];
  for (const s of arr.slice(1)) {
    while (!s.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}
export function getLongestCommonPrefix2(arr: string[]): string {
  return getLongestCommonPrefix(arr);
}
export const arr = ["abc123", "abcd123", "abcde123", "abcdefg123"];
