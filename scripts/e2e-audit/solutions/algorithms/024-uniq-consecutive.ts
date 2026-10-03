export function func(subsequence: string | string[] | number[]) {
  const items = typeof subsequence === "string" ? subsequence.split("") : subsequence;
  const out: (string | number)[] = [];
  for (const item of items) {
    if (out.length === 0 || out[out.length - 1] !== item) out.push(item);
  }
  return out;
}
