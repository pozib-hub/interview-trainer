export function getLongestCommonPrefix(arr: string[]): string {
  if (!arr.length) {
    return "";
  }

  let prefix = arr[0];

  for (const str of arr) {
    while (!str.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);

      if (!prefix) {
        return "";
      }
    }
  }

  return prefix;
}

export function getLongestCommonPrefix2(arr: string[]): string {
  if (!arr.length) {
    return "";
  }

  let prefix = arr.reduce(
    (min, str) => (str.length < min.length ? str : min),
    arr[0]
  );

  for (const str of arr) {
    while (!str.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) {
        return "";
      }
    }
  }

  return prefix;
}

export const arr = ["abc123", "abcd123", "abcde123", "abcdefg123"];
console.log(getLongestCommonPrefix(arr)); // "abc"