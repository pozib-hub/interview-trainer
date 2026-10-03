import { test, expect } from "vitest";
import { findIntersection, findIntersection2 } from "../solution";

test("пересечение двух массивов", () => {
  expect(findIntersection([1, 4, 5, 10, 8], [1, 8, 7, 9, 5])).toEqual([1, 5, 8]);
});

test("пустой первый массив", () => {
  expect(findIntersection([], [1, 2])).toEqual([]);
});

test("пустой второй массив", () => {
  expect(findIntersection([1, 2], [])).toEqual([]);
});

test("нет общих элементов", () => {
  expect(findIntersection([1, 2, 3], [4, 5, 6])).toEqual([]);
});

test("findIntersection2", () => {
  expect(findIntersection2([1, 4, 5, 10, 8], [1, 8, 7, 9, 5])).toEqual([1, 5, 8]);
});
