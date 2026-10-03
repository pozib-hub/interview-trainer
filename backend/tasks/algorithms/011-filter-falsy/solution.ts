export function filterFalsy<T extends Record<string, any> | any[]>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (Array.isArray(item)) return filterFalsy(item);
        if (item && typeof item === "object") return filterFalsy(item);
        return item;
      })
      .filter((item) =>
        Array.isArray(item) ? true : item && typeof item === "object" ? Object.keys(item).length > 0 : Boolean(item)
      ) as T;
  }

  const tempObj: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const item = (obj as Record<string, any>)[key];

    if (Array.isArray(item)) {
      const filteredArray = filterFalsy(item);
      (tempObj as Record<string, any>)[key] = filteredArray;
      return;
    }

    if (item && typeof item === "object") {
      const filteredObj = filterFalsy(item);
      if (Object.keys(filteredObj).length > 0) {
        (tempObj as Record<string, any>)[key] = filteredObj;
      }
      return;
    }

    if (Boolean(item)) {
      (tempObj as Record<string, any>)[key] = item;
    }
  });

  return tempObj as T;
}
