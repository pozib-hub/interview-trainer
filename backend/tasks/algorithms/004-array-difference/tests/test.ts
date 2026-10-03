import { test, expect } from "vitest";
import { func } from "../solution";

test("func([0, 2, 2, 2, 4], [2]) => [0,4]", () => {
  expect(func([0, 2, 2, 2, 4], [2])).toEqual([0,4]);
});

test("func([1, 2, 3], []) => [1, 2, 3]", () => {
  expect(func([1, 2, 3], [])).toEqual([1, 2, 3]);
});

test("func([1, 2, 3], [1, 2]) => [3]", () => {
  expect(func([1, 2, 3], [1, 2])).toEqual([3]);
});
