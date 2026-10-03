export function reduceString(str: string): string {
  let out = "";
  let i = 0;
  while (i < str.length) {
    let j = i;
    while (j < str.length && str[j] === str[i]) j++;
    const count = j - i;
    out += str[i] + (count > 1 ? String(count) : "");
    i = j;
  }
  return out;
}
