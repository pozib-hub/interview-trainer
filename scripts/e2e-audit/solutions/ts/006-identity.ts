export function identity<T extends { length: number }>(arg: T): T {
  console.log(arg.length);
  return arg;
}
