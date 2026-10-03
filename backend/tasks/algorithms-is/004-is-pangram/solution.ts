export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";



export function isPangram(str: string) {
  const upperStr = str.toUpperCase(); // Приводим к верхнему регистру
  return [...alphabet].every((letter) => upperStr.includes(letter));
}

export function isPangramByObj(str: string) {
  const upperStr = str.toUpperCase();

  for (const char of alphabet) {
    const exist = upperStr.includes(char);

    if (!exist) {
      return false;
    }
  }

  return true;
}

export function isPangramSet(str: string): boolean {
  const letters = new Set(str.toUpperCase().replace(/[^A-Z]/g, ""));
  return letters.size === 26;
}

// Тесты
console.log(isPangram("The quick brown fox jumps over the lazy dog")); // true
console.log(isPangram("Hello world")); // false

console.log(isPangramByObj("The quick brown fox jumps over the lazy dog")); // true
console.log(isPangramByObj("Hello world")); // false