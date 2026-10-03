export class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

export const treeOne = new TreeNode(12);
treeOne.left = new TreeNode(7);
treeOne.left.left = new TreeNode(9);
treeOne.right = new TreeNode(3);
treeOne.right.left = new TreeNode(8);
treeOne.right.right = new TreeNode(10);

export const treeTwo = new TreeNode(10);
treeTwo.left = new TreeNode(5);
treeTwo.left.left = new TreeNode(3);
treeTwo.left.right = new TreeNode(7);
treeTwo.right = new TreeNode(15);
treeTwo.right.right = new TreeNode(18);

export const treeThree = new TreeNode(10);
treeThree.left = new TreeNode(5);
treeThree.left.left = new TreeNode(3);
treeThree.left.left.left = new TreeNode(1);
treeThree.left.right = new TreeNode(7);
treeThree.left.right.left = new TreeNode(6);
treeThree.right = new TreeNode(15);
treeThree.right.left = new TreeNode(13);
treeThree.right.right = new TreeNode(18);



export const sumInRange = (root: TreeNode, low: number, high: number) => {
  let result = 0;

  if (root.value >= low && root.value <= high) {
    result += root.value;
  }

  if (root.left) {
    result += sumInRange(root.left, low, high);
  }

  if (root.right) {
    result += sumInRange(root.right, low, high);
  }

  return result;
};

console.log(sumInRange(treeOne, 9, 12)); // 31
console.log(sumInRange(treeOne, 0, 12)); // 49
console.log(sumInRange(treeOne, 9, 0)); //  0
console.log(sumInRange(treeTwo, 7, 15)); // 32
console.log(sumInRange(treeThree, 6, 10)); // 23