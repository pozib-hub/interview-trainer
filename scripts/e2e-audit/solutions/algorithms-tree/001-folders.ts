export type TreeNode = {
  name: string;
  children?: TreeNode[];
};

export const example: TreeNode = {
  name: "src",
  children: [
    {
      name: "node_modules",
      children: [
        {
          name: "package",
          children: [
            { name: "linux", children: [{ name: "run.sh" }] },
            { name: "win32", children: [{ name: "run.bin" }] },
          ],
        },
      ],
    },
    {
      name: "scripts",
      children: [{ name: "my-script.ts" }, { name: "my-script.js" }],
    },
    {
      name: "assets",
      children: [
        { name: "image_4.jpg" },
        { name: "image_3.jpg" },
        { name: "image_2.jpg" },
        { name: "image_1.jpg" },
      ],
    },
    { name: "webpack.config.js" },
    { name: "index.html" },
  ],
};

export const renderTree = (tree: TreeNode) => {
  const stack: { node: TreeNode; depth: number }[] = [{ node: tree, depth: 0 }];
  while (stack.length > 0) {
    const { node, depth } = stack.pop()!;
    console.log("  ".repeat(depth) + node.name);
    const children = node.children ?? [];
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({ node: children[i], depth: depth + 1 });
    }
  }
};
