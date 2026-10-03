import { test, expect } from "vitest";
import "../solution";

test("удвоение чисел", () => {
  expect([1, 2, 3].myMap((x) => x * 2)).toEqual([2, 4, 6]);
});

test("пустой массив", () => {
  expect([].myMap((x) => x)).toEqual([]);
});

test("преобразование типов", () => {
  expect([1, 2, 3].myMap((x) => String(x))).toEqual(["1", "2", "3"]);
});

test("передаёт index", () => {
  expect(["a", "b", "c"].myMap((_, i) => i)).toEqual([0, 1, 2]);
});

test("передаёт array", () => {
  const arr = [10, 20, 30];
  arr.myMap((item, _, array) => {
    expect(array).toBe(arr);
    return item;
  });
});

test("длина результата совпадает", () => {
  expect([1, 2, 3, 4, 5].myMap((x) => x)).toHaveLength(5);
});
