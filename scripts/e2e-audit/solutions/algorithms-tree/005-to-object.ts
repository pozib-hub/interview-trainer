export type Tree = { [key: string]: Tree | string };
export type FlatTree = { [key: string]: string };

export const tree: Tree = {
  a: {
    b: "two",
    c: { d: "one" },
  },
};

export function treeFn(obj: Tree, prefix = ""): FlatTree {
  const out: FlatTree = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(out, treeFn(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
}
export function treeFn2(obj: Tree): FlatTree {
  return treeFn(obj);
}
