import { test, expect } from "vitest";
import { radixSort } from "../solution";

test("сортирует массив", () => {
  expect(radixSort([170, 45, 75, 90, 2, 24, 802, 66])).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
});

test("пустой массив", () => {
  expect(radixSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(radixSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(radixSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("дубликаты", () => {
  expect(radixSort([3, 1, 3, 1, 2])).toEqual([1, 1, 2, 3, 3]);
});
