export function lengthOfLongestSubstring(s: string): number {
  const lastSeen = new Map<string, number>();
  let start = 0;
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (lastSeen.has(ch) && lastSeen.get(ch)! >= start) {
      start = lastSeen.get(ch)! + 1;
    }
    lastSeen.set(ch, i);
    if (i - start + 1 > max) max = i - start + 1;
  }
  return max;
}
