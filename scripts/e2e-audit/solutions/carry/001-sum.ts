export function sum(a?: number) {
  let acc = a ?? 0;
  const chain = (b?: number) => {
    if (b === undefined) return acc;
    acc += b;
    return chain;
  };
  return a === undefined ? acc : chain;
}
