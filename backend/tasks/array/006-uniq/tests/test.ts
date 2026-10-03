import { test, expect } from "vitest";
import { uniq, uniq2 } from "../solution";

test("uniq: числа", () => {
  expect(uniq([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
});

test("uniq: строки", () => {
  expect(uniq(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
});

test("uniq: пустой массив", () => {
  expect(uniq([])).toEqual([]);
});

test("uniq: объекты", () => {
  expect(uniq([{ a: 1 }, { a: 1 }, { a: 2 }])).toEqual([{ a: 1 }, { a: 2 }]);
});

test("uniq2: числа", () => {
  expect(uniq2([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
});

test("uniq2: объекты", () => {
  expect(uniq2([{ a: 1 }, { a: 1 }, { a: 2 }])).toEqual([{ a: 1 }, { a: 2 }]);
});

test("uniq2: пустой массив", () => {
  expect(uniq2([])).toEqual([]);
});
