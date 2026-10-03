export type TreeNode = {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export const treeOne: TreeNode = {
  val: 12,
  left: { val: 7, left: { val: 9, left: null, right: null }, right: null },
  right: { val: 3, left: { val: 8, left: null, right: null }, right: { val: 10, left: null, right: null } },
};

export const treeTwo: TreeNode = {
  val: 10,
  left: { val: 5, left: { val: 3, left: null, right: null }, right: { val: 7, left: null, right: null } },
  right: { val: 15, left: null, right: { val: 18, left: null, right: null } },
};

export const treeThree: TreeNode = {
  val: 10,
  left: {
    val: 5,
    left: { val: 3, left: { val: 1, left: null, right: null }, right: null },
    right: { val: 7, left: { val: 6, left: null, right: null }, right: null },
  },
  right: {
    val: 15,
    left: { val: 13, left: null, right: null },
    right: { val: 18, left: null, right: null },
  },
};

export const sumInRange = (root: TreeNode, low: number, high: number) => {
  if (low > high) return 0;
  let sum = 0;
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.val >= low && node.val <= high) sum += node.val;
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return sum;
};
