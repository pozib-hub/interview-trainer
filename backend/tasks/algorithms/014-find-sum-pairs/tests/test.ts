import { test, expect } from "vitest";
import { findSumPairs } from "../solution";

test("находит пару", () => {
  expect(findSumPairs([6, 4, 7, 0, 1, 2, 8, 5], 7)).toEqual([6, 1]);
});

test("нет пары", () => {
  expect(findSumPairs([1, 2, 3], 100)).toEqual([]);
});

test("пустой массив", () => {
  expect(findSumPairs([], 5)).toEqual([]);
});

test("пара из одинаковых чисел", () => {
  expect(findSumPairs([3, 3, 4], 6)).toEqual([3, 3]);
});
