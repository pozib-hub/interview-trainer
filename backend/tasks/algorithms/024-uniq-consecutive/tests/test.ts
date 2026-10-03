import { test, expect } from "vitest";
import { func } from "../solution";

test("убирает подряд идущие дубликаты (строка)", () => {
  expect(func("AAABBBCCC")).toEqual(["A", "B", "C"]);
});

test("убирает подряд идущие дубликаты (массив чисел)", () => {
  expect(func([1, 1, 2, 2, 3, 3])).toEqual([1, 2, 3]);
});

test("без дубликатов", () => {
  expect(func([1, 2, 3])).toEqual([1, 2, 3]);
});

test("пустой массив", () => {
  expect(func([])).toEqual([]);
});

test("один элемент", () => {
  expect(func([42])).toEqual([42]);
});
