import { test, expect } from "vitest";
import { sumInRange, treeOne, treeTwo, treeThree } from "../solution";

test("sumInRange(treeOne, 9, 12) => 31", () => {
  expect(sumInRange(treeOne, 9, 12)).toBe(31);
});

test("sumInRange(treeOne, 0, 12) => 49", () => {
  expect(sumInRange(treeOne, 0, 12)).toBe(49);
});

test("sumInRange(treeOne, 9, 0) => 0", () => {
  expect(sumInRange(treeOne, 9, 0)).toBe(0);
});

test("sumInRange(treeTwo, 7, 15) => 32", () => {
  expect(sumInRange(treeTwo, 7, 15)).toBe(32);
});

test("sumInRange(treeThree, 6, 10) => 23", () => {
  expect(sumInRange(treeThree, 6, 10)).toBe(23);
});
