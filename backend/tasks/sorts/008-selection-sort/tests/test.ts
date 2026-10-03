import { test, expect } from "vitest";
import { selectionSort } from "../solution";

test("сортирует массив", () => {
  expect(selectionSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(selectionSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(selectionSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(selectionSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("обратный порядок", () => {
  expect(selectionSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
});
