export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function isPangram(str: string) {
  const lower = str.toLowerCase();
  for (const letter of alphabet.toLowerCase()) {
    if (!lower.includes(letter)) return false;
  }
  return true;
}
export function isPangramByObj(str: string) {
  const seen: Record<string, boolean> = {};
  for (const ch of str.toLowerCase()) {
    seen[ch] = true;
  }
  for (const letter of alphabet.toLowerCase()) {
    if (!seen[letter]) return false;
  }
  return true;
}
export function isPangramSet(str: string): boolean {
  const letters = new Set(
    str.toLowerCase().split("").filter((ch) => ch >= "a" && ch <= "z")
  );
  return letters.size === 26;
}
