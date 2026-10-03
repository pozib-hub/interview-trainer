export const firstUniqChar = (string: string) => {
  const counts = new Map<string, number>();
  for (const ch of string) counts.set(ch, (counts.get(ch) || 0) + 1);
  for (const ch of string) {
    if (counts.get(ch) === 1) return ch;
  }
  return null;
};
