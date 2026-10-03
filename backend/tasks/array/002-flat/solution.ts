declare global {
  interface Array<T> {
    flatRecurs<U = T>(depth: number): U[];
    flatStack<U = T>(depth: number): U[];
  }
}

// prettier-ignore
export const example = [1, 8, [4, 6], 3, [[4, 66], 6], 8, [1, [11, [22], [33, [44, 444, [6]]]]], 3, [7, 7], 5, [5555, [6666, 7777, [9999, 0]]], 9,];

Array.prototype.flatRecurs = function <T>(depth: number = 1) {
  if (depth < 1) return [...this] as T[];

  const result: T[] = [];

  function flatten(array: unknown[], currentDepth: number) {
    array.forEach((item) => {
      if (Array.isArray(item) && currentDepth > 0) {
        flatten(item, currentDepth - 1);
      } else {
        result.push(item as T);
      }
    });
  }

  flatten(this, depth);

  return result;
};

Array.prototype.flatStack = function <T>(depth: number = 1): T[] {
  if (depth < 1) return [...this] as T[];

  const result: T[] = [];
  const stack: { item: unknown; depth: number }[] = this.map((item) => ({
    item,
    depth,
  }));

  while (stack.length) {
    const { item, depth: currentDepth } = stack.pop()!;

    if (Array.isArray(item) && currentDepth > 0) {
      // при каждом уровне уменьшаем вложенность
      const array = item.map((subItem) => ({
        item: subItem,
        depth: currentDepth - 1,
      }));

      stack.push(...array);
    } else {
      result.push(item as T);
    }
  }

  return result.reverse();
};

console.dir(example.flatStack(2), { depth: null });
console.dir(example.flatRecurs(2), { depth: null });