export function filterFalsy<T extends Record<string, any> | any[]>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj
      .map((x) => (x !== null && typeof x === "object" ? filterFalsy(x) : x))
      .filter(Boolean) as T;
  }
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const processed = v !== null && typeof v === "object" ? filterFalsy(v) : v;
    if (Boolean(processed)) out[k] = processed;
  }
  return out as T;
}
