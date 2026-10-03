import { test, expect } from "vitest";
import { matrix } from "../solution";

test("matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 3) => true", () => {
  expect(matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3)).toBe(true);
});

test("matrix([[1,3,5,7],[10,11,16,20],[23,30,34,60]], 13) => false", () => {
  expect(matrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13)).toBe(false);
});

test("matrix([[1,3,5,7]], 7) => true (одна строка)", () => {
  expect(matrix([[1, 3, 5, 7]], 7)).toBe(true);
});

test("matrix([[1],[3],[5],[7]], 5) => true (один столбец)", () => {
  expect(matrix([[1], [3], [5], [7]], 5)).toBe(true);
});

test("matrix([], 5) => false (пустая матрица)", () => {
  expect(matrix([], 5)).toBe(false);
});

test("matrix([[]], 5) => false (пустые строки)", () => {
  expect(matrix([[]], 5)).toBe(false);
});

test("matrix([[1]], 1) => true (1x1)", () => {
  expect(matrix([[1]], 1)).toBe(true);
});

test("matrix([[1]], 2) => false (1x1, числа нет)", () => {
  expect(matrix([[1]], 2)).toBe(false);
});
