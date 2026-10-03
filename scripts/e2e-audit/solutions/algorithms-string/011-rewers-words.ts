export function reverseWords(str: string): string {
  const words = str.split(" ");
  return words.map((w) => w.split("").reverse().join("")).join(" ");
}
export const reverseWordsMap = (str = "") => {
  return str
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
};
