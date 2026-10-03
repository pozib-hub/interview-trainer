import { test, expect } from "vitest";
import { createObject } from "../solution";

test("базовый случай", () => {
  expect(createObject(["a", "b", "c"], [1, 2, 3])).toEqual({
    a: 1,
    b: 2,
    c: 3,
  });
});

test("дублирующийся ключ после преобразования в строку", () => {
  expect(createObject(["1", 1, false], [4, 5, 6])).toEqual({
    1: 4,
    false: 6,
  });
});

test("пустые массивы", () => {
  expect(createObject([], [])).toEqual({});
});

test("ключ null преобразуется в строку", () => {
  expect(createObject(["a", null], [1, 2])).toEqual({ a: 1, null: 2 });
});

test("ключ undefined преобразуется в строку", () => {
  expect(createObject(["a", undefined], [1, 2])).toEqual({
    a: 1,
    undefined: 2,
  });
});

test("повторяющиеся строковые ключи — берётся первое вхождение", () => {
  expect(createObject(["x", "y", "x"], [10, 20, 30])).toEqual({
    x: 10,
    y: 20,
  });
});

test("значение 0 не считается пропуском ключа", () => {
  expect(createObject(["a", "b"], [0, false])).toEqual({ a: 0, b: false });
});

test("дубликат через число и строку", () => {
  expect(createObject([2, "2"], ["first", "second"])).toEqual({ 2: "first" });
});
