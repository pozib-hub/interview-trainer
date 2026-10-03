export function isAnagramSort(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;
  return s1.split("").sort().join("") === s2.split("").sort().join("");
}
export function isAnagram(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;
  const counts: Record<string, number> = {};
  for (const ch of s1) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of s2) {
    if (!counts[ch]) return false;
    counts[ch]--;
  }
  return true;
}
