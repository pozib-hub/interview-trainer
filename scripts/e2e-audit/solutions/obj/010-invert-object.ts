export function invertObject(obj: Record<any, any>): Record<any, any> {
  const out: Record<string, any> = {};
  const entries = Array.isArray(obj)
    ? obj.map((v, i) => [String(i), v] as [string, string])
    : Object.entries(obj).map(([k, v]) => [k, v] as [string, string]);

  for (const [key, value] of entries) {
    if (!(value in out)) {
      out[value] = key;
    } else if (Array.isArray(out[value])) {
      out[value].push(key);
    } else {
      out[value] = [out[value], key];
    }
  }
  return out;
}
