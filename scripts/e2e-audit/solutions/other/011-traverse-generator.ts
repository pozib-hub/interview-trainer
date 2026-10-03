export const TraverseGenerator = function* (arr: any[]) {
  const stack: any[] = [...arr].reverse();
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (Array.isArray(item)) {
      for (let i = item.length - 1; i >= 0; i--) {
        stack.push(item[i]);
      }
    } else {
      yield item;
    }
  }
};

export const TraverseGeneratorRecurs = function* (arr: any[]) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* TraverseGeneratorRecurs(item);
    } else {
      yield item;
    }
  }
};
