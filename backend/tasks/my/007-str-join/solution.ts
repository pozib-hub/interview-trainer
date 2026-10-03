export const strJoin = (separator: string, ...args: string[]) => {
  return args.join(separator);
};

export function strJoin2() {
  const separator = arguments[0];
  const [, ...args] = [...arguments];

  return args.join(separator);
}

export function strJoin3() {
  const separator = arguments[0];
  const args = Array.from(arguments).slice(1);

  return args.join(separator);
}

console.log(strJoin("-", "1", "2", "3", "4", "5"));
console.log(strJoin2("-", "1", "2", "3", "4", "5"));
console.log(strJoin3("-", "1", "2", "3", "4", "5"));