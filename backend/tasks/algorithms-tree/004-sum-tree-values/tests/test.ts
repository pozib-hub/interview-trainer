import { test, expect } from "vitest";
import { sumTreeValuesRecurs1, sumTreeValuesRecurs2, sumTreeValuesStack, type TreeNode } from "../solution";

const tree: TreeNode = {
  value: 1,
  children: [
    { value: 2, children: [] },
    { value: 3, children: [{ value: 4, children: [] }] },
  ],
};

test("sumTreeValuesRecurs1", () => {
  expect(sumTreeValuesRecurs1(tree)).toBe(10);
});

test("sumTreeValuesRecurs2", () => {
  expect(sumTreeValuesRecurs2(tree)).toBe(10);
});

test("sumTreeValuesStack", () => {
  expect(sumTreeValuesStack(tree)).toBe(10);
});

test("один узел", () => {
  const single: TreeNode = { value: 42, children: [] };
  expect(sumTreeValuesRecurs1(single)).toBe(42);
  expect(sumTreeValuesRecurs2(single)).toBe(42);
  expect(sumTreeValuesStack(single)).toBe(42);
});
