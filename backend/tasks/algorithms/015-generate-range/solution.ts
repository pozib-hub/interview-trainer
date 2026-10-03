export function range(a: number, b: number): number[] {
  const result: number[] = [];

  // 4 < 9
  if (a < b) {
    for (let i = a; i <= b; i++) {
      result.push(i);
    }
  } else {
    for (let i = a; i >= b; i--) {
      result.push(i);
    }
  }

  return result;
}

export function range2(a: number, b: number): number[] {
  let length = a < b ? b - a : a - b;
  length += 1;

  return a < b
    ? Array.from({ length }).map((_, i) => i + a)
    : Array.from({ length }).map((_, i) => a - i);
}

console.log(range(5, 9)); // expected: [5, 6, 7, 8, 9]
console.log(range(4, -2)); // expected: [4, 3, 2, 1, 0, -1, −2]