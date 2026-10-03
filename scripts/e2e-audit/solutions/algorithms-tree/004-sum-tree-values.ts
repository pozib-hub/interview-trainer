export type TreeNode = {
  value: number;
  children: TreeNode[];
};

export function sumTreeValuesStack(tree: TreeNode): number {
  let sum = 0;
  const stack: TreeNode[] = [tree];
  while (stack.length > 0) {
    const node = stack.pop()!;
    sum += node.value;
    for (const child of node.children) stack.push(child);
  }
  return sum;
}
export const sumTreeValuesRecurs1 = (tree: TreeNode): number => {
  return tree.value + tree.children.reduce((acc, c) => acc + sumTreeValuesRecurs1(c), 0);
};
export const sumTreeValuesRecurs2 = (tree: TreeNode): number => {
  let sum = tree.value;
  for (const child of tree.children) {
    sum += sumTreeValuesRecurs2(child);
  }
  return sum;
};
