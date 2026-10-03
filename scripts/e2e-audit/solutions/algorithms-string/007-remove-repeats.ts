export function removeRepeats(value: string) {
  if (!value.length) return "";
  let result = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i].toLowerCase() !== value[i - 1].toLowerCase()) {
      result += value[i].toLowerCase();
    }
  }
  return result;
}
export const sentence = "Кккоооот Бааарссиккк зззапрыыгнннул   наааа зааабоооррррр";
