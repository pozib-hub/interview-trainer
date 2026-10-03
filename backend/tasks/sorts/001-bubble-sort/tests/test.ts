import { test, expect } from "vitest";
import { bubbleSort } from "../solution";

test("сортирует массив", () => {
  expect(bubbleSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(bubbleSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(bubbleSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(bubbleSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("обратный порядок", () => {
  expect(bubbleSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
});

test("дубликаты", () => {
  expect(bubbleSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
});
