//(O(N log N))
export function isAnagramSort(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;

  return s1.split("").sort().join("") === s2.split("").sort().join("");
}

// Более оптимальный вариант — подсчитать количество вхождений букв.
export function isAnagram(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;

  const freq: Record<string, number> = {};

  for (const char of s1) {
    freq[char] = (freq[char] || 0) + 1;
  }

  for (const char of s2) {
    if (!freq[char]) {
      return false;
    }

    freq[char]--;
  }

  return true;
}

console.log(isAnagram("listen", "silent")); // true
console.log(isAnagram("hello", "world")); // false
console.log(isAnagram("anagram", "nagaram")); // true