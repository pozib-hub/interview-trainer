import { test, expect } from "vitest";
import { minDifference, countShips } from "../solution";

test("minDifference — базовый случай", () => {
  expect(minDifference([9, 4, 1, 7], 2)).toBe(2);
});

test("minDifference — k = 3", () => {
  expect(minDifference([9, 4, 1, 7], 3)).toBe(5);
});

test("minDifference — k = 1", () => {
  expect(minDifference([1, 2, 3], 1)).toBe(0);
});

test("minDifference — пустой массив", () => {
  expect(minDifference([], 2)).toBe(0);
});

test("countShips — один корабль 1x1", () => {
  expect(countShips([[1]])).toBe(1);
});

test("countShips — горизонтальный корабль", () => {
  expect(countShips([[1, 1, 1, 0]])).toBe(1);
});

test("countShips — два корабля", () => {
  expect(countShips([
    [1, 0, 1],
    [1, 0, 0],
  ])).toBe(2);
});

test("countShips — пустая матрица", () => {
  expect(countShips([[0, 0], [0, 0]])).toBe(0);
});

test("countShips — вертикальный корабль", () => {
  expect(countShips([
    [1],
    [1],
    [0],
    [1],
  ])).toBe(2);
});
