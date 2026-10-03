export type TreeNode = {
  value: number;
  children: TreeNode[];
};



export const sumTreeValuesRecurs1 = (tree: TreeNode): number => {
  if (!tree) return 0; // Если узел пустой, возвращаем 0

  return (
    tree.value +
    tree.children.reduce((sum, child) => sum + sumTreeValuesRecurs1(child), 0)
  );
};

export const sumTreeValuesRecurs2 = (tree: TreeNode): number => {
  if (!tree) return 0; // Если узел пустой, возвращаем 0

  let sum = tree.value;

  for (let i = 0; i < tree.children.length; i++) {
    const children = tree.children[i];
    sum += sumTreeValuesRecurs2(children);
  }

  return sum;
};

export function sumTreeValuesStack(tree: TreeNode): number {
  let sum = 0;
  const stack = [tree];

  while (stack.length > 0) {
    const node = stack.pop()!;

    sum += node.value;
    console.log(node);

    // Добавляем всех детей в стек (если есть)
    for (let child of node.children) {
      stack.push(child);
    }
  }

  return sum;
}