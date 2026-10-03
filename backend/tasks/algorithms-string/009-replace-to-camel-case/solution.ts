export function toCamelCase(subsequence: string) {
  let result = "";

  for (let i = 0; i < subsequence.length; i++) {
    const curItem = subsequence[i];
    const nextItem = subsequence[i + 1];

    if (curItem === "-" || curItem === "_") {
      result += nextItem ? nextItem.toLocaleUpperCase() : "";
      i++;
      continue;
    }

    result += curItem;
  }

  return result;
}

export function toCamelCase2(str: string): string {
  return str
    .split(/[-_]/) // Разбиваем строку по `-` или `_`
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(""); // Объединяем обратно
}