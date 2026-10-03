export const isSymbol = (str: string) => {
  return !/[a-zA-Zа-яА-ЯёЁ]/.test(str);
};
export const isPalindrome = (str: string) => {
  const normalized = str
    .toLowerCase()
    .split("")
    .filter((ch) => /[a-zа-яё0-9]/.test(ch))
    .join("");
  return normalized === normalized.split("").reverse().join("");
};
