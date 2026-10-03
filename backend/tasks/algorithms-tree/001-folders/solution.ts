export type TreeNode = {
  name: string;
  children?: TreeNode[];
};

export const example: TreeNode = {
  name: "src",
  children: [
    { name: "index.html" },
    { name: "webpack.config.js" },
    {
      name: "assets",
      children: [
        { name: "image_1.jpg" },
        { name: "image_2.jpg" },
        { name: "image_3.jpg" },
        { name: "image_4.jpg" },
      ],
    },
    {
      name: "scripts",
      children: [{ name: "my-script.js" }, { name: "my-script.ts" }],
    },
    {
      name: "node_modules",
      children: [
        {
          name: "package",
          children: [
            {
              name: "win32",
              children: [{ name: "run.bin" }],
            },
            {
              name: "linux",
              children: [{ name: "run.sh" }],
            },
          ],
        },
      ],
    },
  ],
};



export const renderTree = (tree: TreeNode) => {
  const stack = [{ tree, level: 0 }];

  while (stack.length) {
    const current = stack.pop();

    if (current) {
      console.log(" ".repeat(current.level) + current?.tree.name);
    }

    if (current?.tree.children) {
      current?.tree.children.forEach((child) => {
        stack.push({ tree: child, level: current.level + 2 });
      });
    }
  }
};

renderTree(example);