import { test, expect } from "vitest";
import { chunk } from "../solution";

test("размер 1: каждый элемент в своём подмассиве", () => {
  expect(chunk([1, 2, 3, 4, 5], 1)).toEqual([[1], [2], [3], [4], [5]]);
});

test("последний чанк короче", () => {
  expect(chunk([1, 9, 6, 3, 2], 3)).toEqual([
    [1, 9, 6],
    [3, 2],
  ]);
});

test("size больше длины массива", () => {
  expect(chunk([8, 5, 3, 2, 6], 6)).toEqual([[8, 5, 3, 2, 6]]);
});

test("пустой массив", () => {
  expect(chunk([], 1)).toEqual([]);
});

test("точное деление", () => {
  expect(chunk([1, 2, 3, 4], 2)).toEqual([
    [1, 2],
    [3, 4],
  ]);
});

test("size равен длине массива", () => {
  expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
});

test("работает со строками", () => {
  expect(chunk(["a", "b", "c", "d"], 2)).toEqual([
    ["a", "b"],
    ["c", "d"],
  ]);
});
