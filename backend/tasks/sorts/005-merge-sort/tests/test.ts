import { test, expect } from "vitest";
import { mergeSort, merge } from "../solution";

test("сортирует массив", () => {
  expect(mergeSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(mergeSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(mergeSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(mergeSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("merge: два отсортированных массива", () => {
  expect(merge([1, 3, 5], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6]);
});

test("merge: один пустой", () => {
  expect(merge([], [1, 2, 3])).toEqual([1, 2, 3]);
});
