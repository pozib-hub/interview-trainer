import { test, expect } from "vitest";
import { get } from "../solution";

test("получение значения по одному ключу", () => {
  expect(get({ a: 1 }, "a")).toBe(1);
});

test("получение вложенного значения", () => {
  const obj = { a: { b: { c: { d: 42 } } } };
  expect(get(obj, "a.b.c.d")).toBe(42);
});

test("несуществующий путь", () => {
  expect(get({ a: 1 }, "b")).toBeUndefined();
});

test("несуществующий вложенный путь", () => {
  expect(get({ a: { b: 1 } }, "a.c")).toBeUndefined();
});

test("путь через null", () => {
  expect(get({ a: null }, "a.b")).toBeUndefined();
});

test("пустая строка пути", () => {
  expect(get({ a: 1 }, "")).toBeUndefined();
});

test("получение массива", () => {
  expect(get({ list: [1, 2, 3] }, "list")).toEqual([1, 2, 3]);
});
