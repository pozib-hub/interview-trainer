export function shuffle(codes: string[]) {
  for (let i = codes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [codes[i], codes[j]] = [codes[j], codes[i]];
  }
}

export function createCodesGenerator(min: number, max: number) {
  const length = max - min + 1;
  const lengthMax = String(max).length;
  const codes = Array.from({ length }, (_, index) =>
    String(min + index).padStart(lengthMax, "0")
  );
  shuffle(codes);
  return () => {
    if (codes.length === 0) return "Все коды зарезервированы";
    return codes.shift();
  };
}
