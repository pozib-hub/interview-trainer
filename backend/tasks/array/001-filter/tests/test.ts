import { test, expect } from "vitest";
import "../solution";

test("фильтрация чётных чисел", () => {
  expect([1, 2, 3, 4, 5].myFilter((x) => x % 2 === 0)).toEqual([2, 4]);
});

test("пустой массив", () => {
  expect([].myFilter((x) => x)).toEqual([]);
});

test("все элементы проходят фильтр", () => {
  expect([1, 2, 3].myFilter(() => true)).toEqual([1, 2, 3]);
});

test("ни один элемент не проходит", () => {
  expect([1, 2, 3].myFilter(() => false)).toEqual([]);
});

test("передаёт index и array", () => {
  const arr = [10, 20, 30];
  const indices: number[] = [];
  arr.myFilter((_, index) => {
    indices.push(index);
    return true;
  });
  expect(indices).toEqual([0, 1, 2]);
});

test("фильтрация строк", () => {
  expect(["apple", "banana", "cherry"].myFilter((s) => s.startsWith("a"))).toEqual(["apple"]);
});
