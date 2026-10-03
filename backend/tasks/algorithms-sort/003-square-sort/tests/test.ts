import { test, expect } from "vitest";
import { squareSort } from "../solution";

test("квадраты положительных чисел", () => {
  expect(squareSort([1, 2, 3, 4, 5])).toEqual([1, 4, 9, 16, 25]);
});

test("с отрицательными числами", () => {
  expect(squareSort([-4, -1, 0, 3, 10])).toEqual([0, 1, 9, 16, 100]);
});

test("пустой массив", () => {
  expect(squareSort([])).toEqual([]);
});

test("один элемент", () => {
  expect(squareSort([3])).toEqual([9]);
});
