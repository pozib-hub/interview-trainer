export const revertStr = (str: string) => {
  return str.split("").reverse().join("");
};
export const mirror = (obj: Record<string, undefined>) => {
  const out: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    out[key] = revertStr(key);
  }
  return out;
};
