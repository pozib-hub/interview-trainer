import { test, expect } from "vitest";
import { shellSort } from "../solution";

test("сортирует массив", () => {
  expect(shellSort([5, 3, 8, 1, 2])).toEqual([1, 2, 3, 5, 8]);
});

test("пустой массив", () => {
  expect(shellSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(shellSort([42])).toEqual([42]);
});

test("уже отсортирован", () => {
  expect(shellSort([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
});

test("обратный порядок", () => {
  expect(shellSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
});
