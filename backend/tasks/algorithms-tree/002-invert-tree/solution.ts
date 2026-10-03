export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val ?? 0;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}



// Рекурсивный метод
export function invertTreeRecurs(root: TreeNode | null): TreeNode | null {
  if (!root) return null;

  // Меняем местами левое и правое поддерево
  [root.left, root.right] = [
    invertTreeRecurs(root.right),
    invertTreeRecurs(root.left),
  ];

  return root;
}

// Итеративный метод (через очередь)
export function invertTreeQueue(root: TreeNode | null): TreeNode | null {
  if (!root) return null;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!; // Извлекаем узел (оператор ! говорит, что node не undefined)

    // Меняем местами левое и правое поддерево
    [node.left, node.right] = [node.right, node.left];

    // Добавляем в очередь детей (если они есть)
    if (node.left) {
      queue.push(node.left);
    }
    if (node.right) {
      queue.push(node.right);
    }
  }

  return root;
}

// Пример использования
export const left = new TreeNode(2, new TreeNode(4), new TreeNode(5));
export const right = new TreeNode(3, new TreeNode(6), new TreeNode(7));
export const root = new TreeNode(1, left, right);

console.log(invertTreeRecurs(root)); // Проверяем рекурсивный метод
console.log(invertTreeQueue(root)); // Проверяем итеративный метод