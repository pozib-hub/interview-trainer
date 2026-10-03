import { test, expect } from "vitest";
import { diff } from "../solution";

test("разница отсортированных массивов", () => {
  expect(diff([1, 2, 3], [2, 4])).toEqual([1, 3]);
});

test("пустой второй массив", () => {
  expect(diff([1, 2, 3], [])).toEqual([1, 2, 3]);
});

test("пустой первый массив", () => {
  expect(diff([], [1, 2])).toEqual([]);
});

test("нет общих элементов", () => {
  expect(diff([1, 3, 5], [2, 4, 6])).toEqual([1, 3, 5]);
});

test("все элементы общие", () => {
  expect(diff([1, 2, 3], [1, 2, 3])).toEqual([]);
});
