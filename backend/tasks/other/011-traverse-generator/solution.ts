export const TraverseGenerator = function* (arr: any[]) {
  const arrayValues = arr.flat(Infinity);
  for (let i = 0; i < arrayValues.length; i++) {
    yield arrayValues[i];
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
