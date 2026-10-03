import { test, expect } from "vitest";
import { range, range2 } from "../solution";

test("range(5, 9) => [5, 6, 7, 8, 9]", () => {
  expect(range(5, 9)).toEqual([5, 6, 7, 8, 9]);
});

test("range(4, -2) => [4, 3, 2, 1, 0, -1, -2]", () => {
  expect(range(4, -2)).toEqual([4, 3, 2, 1, 0, -1, -2]);
});

test("range(1, 1) => [1]", () => {
  expect(range(1, 1)).toEqual([1]);
});

test("range2(5, 9) => [5, 6, 7, 8, 9]", () => {
  expect(range2(5, 9)).toEqual([5, 6, 7, 8, 9]);
});

test("range2(4, -2) => [4, 3, 2, 1, 0, -1, -2]", () => {
  expect(range2(4, -2)).toEqual([4, 3, 2, 1, 0, -1, -2]);
});
