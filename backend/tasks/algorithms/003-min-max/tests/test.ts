import { test, expect } from "vitest";
import { findMin, findMax } from "../solution";

test("findMin([5, 2, 8, 1, 4]) => 1", () => {
  expect(findMin([5, 2, 8, 1, 4])).toBe(1);
});

test("findMax([5, 2, 8, 1, 4]) => 8", () => {
  expect(findMax([5, 2, 8, 1, 4])).toBe(8);
});
