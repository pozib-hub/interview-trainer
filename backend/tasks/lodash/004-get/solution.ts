export function get(obj: any, path: string): any {
  const pathKeys = path.split(".");
  let tempObj: any = obj;
  for (const key of pathKeys) {
    if (typeof tempObj === "object" && tempObj !== null && key in tempObj) {
      tempObj = tempObj[key];
    } else {
      return undefined;
    }
  }
  return tempObj;
}
