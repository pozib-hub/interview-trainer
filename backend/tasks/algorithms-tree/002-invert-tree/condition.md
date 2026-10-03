# Инвертировать бинарное дерево» Invert Binary Tree)

Инвертировать бинарное дерево» Invert Binary Tree)
  Нужно поменять местами левое и правое поддеревья у каждого узла бинарного дерева.

  const left = new TreeNode(2, new TreeNode(4), new TreeNode(5));
  const right = new TreeNode(3, new TreeNode(6), new TreeNode(7));
  const root = new TreeNode(1, left, right);

  root =         
        1
       / \
      2   3
     / \  / \
    4   5 6  7


  Ввод: root
  Вывод:

        1
       / \
      3   2
     / \  / \
    7   6 5  4
