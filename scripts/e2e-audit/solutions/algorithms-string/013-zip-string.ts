export const fn = (str: string): string[][] => {
  const words = str.split(" ");
  const maxLen = Math.max(...words.map((w) => w.length));
  const out: string[][] = [];
  for (let i = 0; i < maxLen; i++) {
    out.push(words.map((w) => w[i] ?? ""));
  }
  return out;
};
