export const cloneDeepRecurs = <T>(obj: T): T => {
  const newObj: any = Array.isArray(obj) ? [] : {};
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  for (const key of Object.keys(obj as any)) {
    if (Array.isArray((obj as any)[key])) {
      newObj[key] = (obj as any)[key].map((item: any) => cloneDeepRecurs(item));
      continue;
    }
    if ((obj as any)[key] !== null && typeof (obj as any)[key] === "object") {
      newObj[key] = cloneDeepRecurs((obj as any)[key]);
      continue;
    }
    newObj[key] = (obj as any)[key];
  }
  return newObj;
};

export const cloneDeepWhile = <T extends object>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const rootClone: any = Array.isArray(obj) ? [] : {};
  const stack: Array<{ clonedObj: any; tempObj: any }> = [
    { clonedObj: obj, tempObj: rootClone },
  ];
  while (stack.length) {
    const current = stack.pop()!;
    const { clonedObj, tempObj } = current;
    const keysClonedObj = Object.keys(clonedObj);
    for (const key of keysClonedObj) {
      if (clonedObj[key] !== null && typeof clonedObj[key] === "object") {
        tempObj[key] = Array.isArray(clonedObj[key]) ? [] : {};
        stack.push({ clonedObj: clonedObj[key], tempObj: tempObj[key] });
      } else {
        tempObj[key] = clonedObj[key];
      }
    }
  }
  return rootClone;
};
