export const revertStr = (str: string) => {
  let result = "";

  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }

  return result;
};

export const mirror = (obj: Record<string, undefined>) => {
  const tempObj: Record<string, string> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      tempObj[key] = revertStr(key);
    }
  }

  return tempObj;
};