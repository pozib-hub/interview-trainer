export const sentence = "Кккоооот Бааарссиккк зззапрыыгнннул   наааа зааабоооррррр";

export function removeRepeats(value: string) {
  if (!value.length) return "";

  let result = value[0];

  for (let i = 1; i < value.length; i++) {
    const currChar = value[i].toLowerCase();
    const prevChar = value[i - 1].toLowerCase();

    if (currChar !== prevChar) {
      result += currChar;
    }
  }

  return result;
}
