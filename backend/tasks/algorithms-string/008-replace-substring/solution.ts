export function replaceSubstring(
  str: string,
  search: string,
  replace: string
): string {
  return str.split(search).join(replace);
}

export function replaceSubstring2(
  str: string,
  search: string,
  replace: string
): string {
  return str.replaceAll(search, replace);
}

export function replaceSubstring3(
  str: string,
  search: string,
  replace: string
): string {
  return str.replace(new RegExp(search, "g"), replace);
}

export function replaceSubstring4(
  str: string,
  search: string,
  replace: string
): string {
  let result = "";
  let i = 0;

  while (i < str.length) {
    if (str.startsWith(search, i)) {
      result += replace;
      i += search.length;
    } else {
      result += str[i];
      i++;
    }
  }

  return result;
}

export function replaceSubstring5(
  str: string,
  search: string,
  replace: string
): string {
  let result: string[] = [];
  let i = 0;

  while (i < str.length) {
    if (str.startsWith(search, i)) {
      result.push(replace);
      i += search.length;
    } else {
      result.push(str[i]);
      i++;
    }
  }

  return result.join("");
}

console.log(replaceSubstring("hello world", "world", "there")); // Ввод: "hello there"
console.log(replaceSubstring("abc abc abc", "abc", "123")); // Bывод: "123 123 123"