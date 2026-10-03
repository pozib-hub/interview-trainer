export function createObject(
  keysArr: unknown[],
  valuesArr: unknown[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const seen = new Set<string>();
  for (let i = 0; i < keysArr.length; i++) {
    const key = String(keysArr[i]);
    if (seen.has(key)) continue;
    seen.add(key);
    out[key] = valuesArr[i];
  }
  return out;
}
