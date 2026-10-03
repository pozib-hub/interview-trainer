export function diff(arr1: number[], arr2: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] === arr2[j]) { i++; j++; continue; }
    if (arr1[i] < arr2[j]) { result.push(arr1[i]); i++; }
    else { j++; }
  }

  while (i < arr1.length) { result.push(arr1[i]); i++; }
  return result;
}
