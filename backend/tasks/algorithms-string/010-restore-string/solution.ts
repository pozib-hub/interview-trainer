export function restoreString1(str: string, arr: number[]): string {
  return arr.map((index) => str[index]).join("");
}

export function restoreString2(str: string, arr: number[]) {
  let result = "";

  arr.forEach((item) => {
    result += str[item];
  });

  return result;
}

console.log(restoreString1("домик", [4, 1, 0, 3, 2])); // кодим
console.log(restoreString2("украл", [1, 4, 3, 2, 0])); // клару