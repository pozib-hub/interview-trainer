import { test, expect } from "vitest";
import { sortAscendingOrder } from "../solution";

test("сортирует чётные по возрастанию, нечётные остаются", () => {
  expect(sortAscendingOrder([1, 8, 3, 9, 12, 13, 2, 5, 6])).toEqual([
    1, 2, 3, 9, 6, 13, 8, 5, 12,
  ]);
});

test("пустой массив", () => {
  expect(sortAscendingOrder([])).toEqual([]);
});

test("только нечётные", () => {
  expect(sortAscendingOrder([1, 3, 5])).toEqual([1, 3, 5]);
});

test("только чётные", () => {
  expect(sortAscendingOrder([4, 2, 8, 6])).toEqual([2, 4, 6, 8]);
});
