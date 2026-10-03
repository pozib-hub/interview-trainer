export function strJoin2(...args: string[]) {
  const [separator, ...rest] = args;
  return rest.join(separator);
}
export function strJoin3(...args: string[]) {
  const [separator, ...rest] = args;
  let out = "";
  for (let i = 0; i < rest.length; i++) {
    if (i > 0) out += separator;
    out += rest[i];
  }
  return out;
}
export const strJoin = (separator: string, ...args: string[]) => {
  return args.join(separator);
};
