export const fuzzySearch = (word: string, query: string): boolean => {
  let wi = 0;
  for (const ch of query) {
    while (wi < word.length && word[wi] !== ch) wi++;
    if (wi >= word.length) return false;
    wi++;
  }
  return true;
};
