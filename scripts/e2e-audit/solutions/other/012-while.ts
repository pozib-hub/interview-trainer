export function getResult(): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < 10) {
    i++;
    out.push(String(i));
  }
  return out;
}
