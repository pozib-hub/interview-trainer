import { test, expect } from "vitest";
import { TreeNode, invertTreeRecurs, invertTreeQueue } from "../solution";

test("invertTreeRecurs — инверсия", () => {
  const root = new TreeNode(1,
    new TreeNode(2, new TreeNode(4), new TreeNode(5)),
    new TreeNode(3, new TreeNode(6), new TreeNode(7))
  );

  invertTreeRecurs(root);

  expect(root.left?.val).toBe(3);
  expect(root.right?.val).toBe(2);
  expect(root.left?.left?.val).toBe(7);
  expect(root.right?.left?.val).toBe(5);
});

test("invertTreeRecurs — null", () => {
  expect(invertTreeRecurs(null)).toBeNull();
});

test("invertTreeQueue — инверсия", () => {
  const root = new TreeNode(1,
    new TreeNode(2),
    new TreeNode(3)
  );

  invertTreeQueue(root);

  expect(root.left?.val).toBe(3);
  expect(root.right?.val).toBe(2);
});

test("invertTreeQueue — null", () => {
  expect(invertTreeQueue(null)).toBeNull();
});
