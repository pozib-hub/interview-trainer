import { test, expect } from "vitest";
import { heapSort, heapify } from "../solution";

test("сортирует массив", () => {
  expect(heapSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(heapSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(heapSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(heapSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("дубликаты", () => {
  expect(heapSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
});
