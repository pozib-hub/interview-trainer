export function reduceString(str: string): string {
  if (!str.length) {
    return "";
  }

  let result = "";
  let countRepeat = 1;
  for (let i = 0; i < str.length; i++) {
    const curr = str[i];
    const next = str[i + 1];

    if (curr === next) {
      countRepeat++;
      continue;
    }

    result += curr + (countRepeat > 1 ? countRepeat : "");
    countRepeat = 1;
  }

  return result;
}

console.log(reduceString("AAABBBBBBBHELPMEEF")); // -> A3B7HELPME2_HEL20WORLD1234G3F
console.log(reduceString("AAABBBBBBBHELPMEE_HELLOWORLD123333GGGF")); // -> A3B7HELPME2_HEL2OWORLD1234G3F