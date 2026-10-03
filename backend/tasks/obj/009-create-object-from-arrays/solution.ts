export function createObject(
  keysArr: unknown[],
  valuesArr: unknown[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (let i = 0; i < keysArr.length; ++i) {
    const k = String(keysArr[i]);
    if (result[k] === undefined) {
      result[k] = valuesArr[i];
    }
  }
  return result;
}
