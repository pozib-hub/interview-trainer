import { test, expect } from "vitest";
import { countingSort } from "../solution";

test("сортирует массив", () => {
  expect(countingSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(countingSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(countingSort([42])).toEqual([42]);
});

test("дубликаты", () => {
  expect(countingSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
});

test("отрицательные числа", () => {
  expect(countingSort([-3, 1, -1, 0])).toEqual([-3, -1, 0, 1]);
});
