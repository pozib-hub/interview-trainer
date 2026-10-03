export const firstUniqChar = (string: string) => {
  const hash = new Map<string, number>();

  for (const char of string) {
    hash.set(char, (hash.get(char) || 0) + 1);

    // if (hash.get(char)) {
    //   hash.set(char, 2);
    //   continue;
    // }

    // hash.set(char, 1);
  }

  for (const [char, count] of hash.entries()) {
    if (count === 1) return char;
  }

  //   for (let key of hash.keys()) {
  //     if (hash.get(key) === 1) {
  //       return key;
  //     }
  //   }

  return null;
};

console.log(firstUniqChar("lleetcode")); // 't'
console.log(firstUniqChar("aabbccdde")); // 'e'
console.log(firstUniqChar("aabbcc")); // null