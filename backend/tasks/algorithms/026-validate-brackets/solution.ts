export const objBrackets: Record<string, string> = {
  "{": "}",
  "[": "]",
  "(": ")",
};

export function validateBrackets(brackets: string): boolean {
  const stack: string[] = [];

  if (brackets.length < 2) {
    return false;
  }

  for (const char of brackets) {
    const isBracket = objBrackets[char];
    const lastItemFromStack = stack[stack.length - 1];

    if (isBracket) {
      stack.push(objBrackets[char]);
      continue;
    }

    if (stack.length === 0) {
      return false;
    }

    if (lastItemFromStack === char) {
      stack.pop();
    } else if (Object.values(objBrackets).includes(char)) {
      return false;
    }
  }

  return stack.length === 0;
}
