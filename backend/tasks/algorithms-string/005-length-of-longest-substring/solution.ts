export function lengthOfLongestSubstring(s: string): number {
  const seen = new Map<string, number>();

  let maxLength = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const char = s[end];

    const itemSeen = seen.get(char);
    if (seen.has(char) && itemSeen! >= start) {
      start = itemSeen! + 1;
    }

    seen.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }

  return maxLength;
}

console.log(lengthOfLongestSubstring("abcabcbb"));