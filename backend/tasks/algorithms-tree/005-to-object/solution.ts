export const tree = {
  a: {
    b: "two",

    c: {
      d: "one",
    },
  },
};

export type Tree = Record<string, any>;
export type FlatTree = Record<string, string>;

// Сложность O(n)
export function treeFn(obj: Tree): FlatTree {
  const result: FlatTree = {};

  function traverse(current: any, path?: string) {
    for (const key in current) {
      const value = current[key];
      const newPath = path ? `${path}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        traverse(value, newPath);
      } else {
        result[newPath] = value;
      }
    }
  }

  traverse(obj);

  return result;
}

export function treeFn2(obj: Tree): FlatTree {
  const result: FlatTree = {};
  const stack = [{ path: "", value: obj }];

  while (stack.length > 0) {
    const { path, value } = stack.pop()!;

    for (const key in value) {
      const newPath = path ? `${path}.${key}` : key;
      const val = value[key];

      if (typeof val === "object" && val !== null) {
        stack.push({ path: newPath, value: val });
      } else {
        result[newPath] = val;
      }
    }
  }

  return result;
}

console.log(treeFn2(tree));

//    console.log(JSON.Parce(treeFn(tree)))
//    {
//     'a.b': 'two',
//     'a.c.d': 'one'
//    }