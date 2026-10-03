export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

export function invertTreeRecurs(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTreeRecurs(root.left);
  invertTreeRecurs(root.right);
  return root;
}

export function invertTreeQueue(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    [node.left, node.right] = [node.right, node.left];
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return root;
}

export const left = new TreeNode(2, new TreeNode(4), new TreeNode(5));
export const right = new TreeNode(3, new TreeNode(6), new TreeNode(7));
export const root = new TreeNode(1, left, right);
