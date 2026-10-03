import { test, expect } from "vitest";
import { quickSort } from "../solution";

test("сортирует массив", () => {
  expect(quickSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(quickSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(quickSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(quickSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("дубликаты", () => {
  expect(quickSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
});
