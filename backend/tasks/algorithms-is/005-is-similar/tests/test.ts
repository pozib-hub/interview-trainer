import { test, expect } from "vitest";
import { isSimilar, isSimilar2, isSimilar3 } from "../solution";

test("isSimilar — одинаковые массивы", () => {
  expect(isSimilar([1, 2, 3], [3, 2, 1])).toBe(true);
});

test("isSimilar — разные массивы", () => {
  expect(isSimilar([1, 2, 3], [1, 2, 4])).toBe(false);
});

test("isSimilar — разная длина", () => {
  expect(isSimilar([1, 2], [1, 2, 3])).toBe(false);
});

test("isSimilar2 — одинаковые", () => {
  expect(isSimilar2([1, 2, 3], [3, 2, 1])).toBe(true);
});

test("isSimilar2 — разные", () => {
  expect(isSimilar2([1, 2, 3], [4, 5, 6])).toBe(false);
});

test("isSimilar3 — одинаковые с дубликатами", () => {
  expect(isSimilar3([1, 1, 2], [2, 1, 1])).toBe(true);
});

test("isSimilar3 — разные с дубликатами", () => {
  expect(isSimilar3([1, 1, 2], [1, 2, 2])).toBe(false);
});
