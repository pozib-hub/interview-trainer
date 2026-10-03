import { test, expect } from "vitest";
import { insertionSort } from "../solution";

test("сортирует массив", () => {
  expect(insertionSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(insertionSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(insertionSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(insertionSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("обратный порядок", () => {
  expect(insertionSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
});
