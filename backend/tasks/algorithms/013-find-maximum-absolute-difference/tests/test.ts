import { test, expect } from "vitest";
import { findMaximumAbsoluteDifference, findMaximumAbsoluteDifference2 } from "../solution";

test("макс разница", () => {
  expect(findMaximumAbsoluteDifference([1, 5, 3, 9, 2])).toBe(8);
});

test("два элемента", () => {
  expect(findMaximumAbsoluteDifference([3, 7])).toBe(4);
});

test("отрицательные числа", () => {
  expect(findMaximumAbsoluteDifference([-5, 1, 3])).toBe(8);
});

test("бросает ошибку для массива < 2", () => {
  expect(() => findMaximumAbsoluteDifference([5])).toThrow();
});

test("findMaximumAbsoluteDifference2", () => {
  expect(findMaximumAbsoluteDifference2([1, 5, 3, 9, 2])).toBe(8);
});

test("findMaximumAbsoluteDifference2 бросает ошибку", () => {
  expect(() => findMaximumAbsoluteDifference2([])).toThrow();
});
