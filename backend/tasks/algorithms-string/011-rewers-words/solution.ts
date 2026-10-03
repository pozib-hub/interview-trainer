export function reverseWords(str: string): string {
  let result = "";

  const words = str.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let reversedWord = "";

    for (let j = word.length - 1; j >= 0; j--) {
      reversedWord += word[j];
    }

    if (i > 0) {
      result += " ";
    }
    result += reversedWord;
  }

  return result;
}

export const reverseWordsMap = (str = "") =>
  str
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
