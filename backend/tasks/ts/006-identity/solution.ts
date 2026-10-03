export function identity<T extends { length: number }>(arg: T): T {
  return arg;
}
