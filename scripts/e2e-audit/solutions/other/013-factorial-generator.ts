export function* factorial(n: number): Generator<number> {
  let acc = 1;
  for (let i = 1; i <= n; i++) {
    acc *= i;
    yield acc;
  }
  if (n === 0) {
    yield 1;
  }
}
