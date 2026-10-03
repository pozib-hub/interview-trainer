export function findAnagrams(words: string[]): string[][] | string[] {
  if (!words.length) {
    return [];
  }

  const map: Record<string, string[]> = {};

  words.forEach((word) => {
    const sortedWord = word.split("").sort().join("");

    if (map[sortedWord]) {
      map[sortedWord].push(word);
    } else {
      map[sortedWord] = [word];
    }
  });

  return Object.values(map);
}

console.log(findAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));