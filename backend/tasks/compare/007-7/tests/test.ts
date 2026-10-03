import { test, expect } from "vitest";
import { compareValues } from "../solution";

test("примитивы — равно", () => {
  expect(compareValues(1, 1)).toBe(true);
  expect(compareValues("hello", "hello")).toBe(true);
  expect(compareValues(true, true)).toBe(true);
});

test("примитивы — не равно", () => {
  expect(compareValues(1, 2)).toBe(false);
  expect(compareValues("a", "b")).toBe(false);
});

test("NaN === NaN", () => {
  expect(compareValues(NaN, NaN)).toBe(true);
});

test("null и undefined", () => {
  expect(compareValues(null, null)).toBe(true);
  expect(compareValues(undefined, undefined)).toBe(true);
  expect(compareValues(null, undefined)).toBe(false);
});

test("массивы — глубокое сравнение", () => {
  expect(compareValues([1, 2, 3], [1, 2, 3])).toBe(true);
  expect(compareValues([1, 2, 3], [1, 2, 4])).toBe(false);
  expect(compareValues([1, [2, 3]], [1, [2, 3]])).toBe(true);
});

test("объекты — глубокое сравнение", () => {
  expect(compareValues({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  expect(compareValues({ a: 1 }, { a: 2 })).toBe(false);
  expect(compareValues({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
});

test("разная длина массивов", () => {
  expect(compareValues([1, 2], [1, 2, 3])).toBe(false);
});

test("разные ключи объектов", () => {
  expect(compareValues({ a: 1 }, { b: 1 })).toBe(false);
});
