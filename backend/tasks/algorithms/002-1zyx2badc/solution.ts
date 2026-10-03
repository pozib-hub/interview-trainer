export const input = [
  { value: "abcd", order: 4, expired: false },
  { value: "qwer", order: 2, expired: true },
  { value: "xyzl", order: 1, expired: false },
  { value: "abx2", order: 3, expired: false },
];

export type TInput = typeof input;

export const fn = (input: TInput) => {
  return input
    .filter((item) => !item.expired)
    .sort((a, b) => a.order - b.order)
    .map((item) => item.value.split("").reverse().join(""))
    .join("")
    .split("")
    .filter((char, index, self) => self.indexOf(char) === index)
    .join("");
};
