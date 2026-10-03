export function shuffle(codes: string[]) {
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }
}
export function createCodesGenerator(min: number, max: number) {
  const width = String(max).length;
  const codes: string[] = [];
  for (let n = min; n <= max; n++) codes.push(String(n).padStart(width, "0"));
  shuffle(codes);
  return () => (codes.length ? codes.pop()! : "Все коды зарезервированы");
}
