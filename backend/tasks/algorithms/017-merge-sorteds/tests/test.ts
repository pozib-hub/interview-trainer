import { test, expect } from "vitest";
import { merge } from "../solution";

test("слияние двух отсортированных массивов", () => {
  expect(merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
});

test("один пустой", () => {
  expect(merge([], [1, 2, 3])).toEqual([1, 2, 3]);
  expect(merge([1, 2, 3], [])).toEqual([1, 2, 3]);
});

test("оба пустые", () => {
  expect(merge([], [])).toEqual([]);
});

test("дубликаты", () => {
  expect(merge([1, 3, 3, 7], [3, 6, 7, 8])).toEqual([1, 3, 3, 3, 6, 7, 7, 8]);
});
