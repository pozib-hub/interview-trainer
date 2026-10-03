export function invertObject(obj: Record<any, any>): Record<any, any> {
  const result: Record<any, any> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    if (Object.prototype.hasOwnProperty.call(result, value)) {
      if (Array.isArray(result[value])) {
        result[value].push(key);
      } else {
        result[value] = [result[value], key];
      }
    } else {
      result[value] = key;
    }
  }
  return result;
}
