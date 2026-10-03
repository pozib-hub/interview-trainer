export const fn = (input: TInput) => {
  return [...input]
    .filter((x) => !x.expired)
    .sort((a, b) => a.order - b.order)
    .map((x) => x.value.split("").reverse().join(""))
    .join("")
    .split("")
    .filter((ch, i, arr) => arr.indexOf(ch) === i)
    .join("");
};
export type TInput = { value: string; order: number; expired: boolean }[];
export const input = [
  { value: 'abcd', order: 4, expired: false },
  { value: 'qwer', order: 2, expired: true },
  { value: 'xyzl', order: 1, expired: false },
  { value: 'abx2', order: 3, expired: false },
];
