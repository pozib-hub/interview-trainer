# Реализовать функцию sumTree,

Реализовать функцию sumTree, 
    которая принимает на вход дерево, представленное в виде объекта, 
    и возвращает сумму всех значений (value) в этом дереве.

    const tree: TreeNode = {
      value: 1,
      children: [
        { value: 2, children: [] },
        { value: 3, children: [{ value: 4, children: [] }] },
      ],
    };

    sumTree(tree) => 10 // (1 + 2 + 3 + 4 = 10)
