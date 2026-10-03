export const isSymbol = (str: string) => str.toLocaleUpperCase() === str.toLowerCase();

export const isPalindrome = (str: string) => {
  const lowerStr = str.toLowerCase().replace(/\s/g, "");

  let right = lowerStr.length - 1;

  for (let left = 0; left < lowerStr.length; left++) {
    if (isSymbol(lowerStr[left])) {
      continue;
    }

    if (isSymbol(lowerStr[right])) {
      right--;
      continue;
    }

    if (lowerStr[left] !== lowerStr[right]) {
      return false;
    }

    right--;
  }

  return true;
};
