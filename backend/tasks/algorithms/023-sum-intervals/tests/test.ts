import { test, expect } from "vitest";
import { sumIntervals } from "../solution";

test("sumIntervals([[1,5],[6,10]]) => 8", () => {
  expect(sumIntervals([[1, 5], [6, 10]])).toBe(8);
});

test("sumIntervals([[1,4],[3,5]]) => 4 (перекрытие)", () => {
  expect(sumIntervals([[1, 4], [3, 5]])).toBe(4);
});

test("sumIntervals([[1,2],[2,3],[3,4]]) => 3", () => {
  expect(sumIntervals([[1, 2], [2, 3], [3, 4]])).toBe(3);
});

test("sumIntervals([[1,10],[2,6],[8,12]]) => 11", () => {
  expect(sumIntervals([[1, 10], [2, 6], [8, 12]])).toBe(11);
});

test("sumIntervals([]) => 0", () => {
  expect(sumIntervals([])).toBe(0);
});
