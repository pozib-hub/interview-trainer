import { test, expect } from "vitest";
import { invertObject } from "../solution";

test("простое инвертирование без дубликатов", () => {
  expect(invertObject({ a: "1", b: "2", c: "3", d: "4" })).toEqual({
    1: "a",
    2: "b",
    3: "c",
    4: "d",
  });
});

test("дублирующиеся значения — массив ключей", () => {
  expect(invertObject({ a: "1", b: "2", c: "2", d: "4" })).toEqual({
    1: "a",
    2: ["b", "c"],
    4: "d",
  });
});

test("массив как объект — индексы в значения", () => {
  expect(invertObject(["1", "2", "3", "4"])).toEqual({
    1: "0",
    2: "1",
    3: "2",
    4: "3",
  });
});

test("три ключа с одинаковым значением", () => {
  expect(invertObject({ a: "x", b: "x", c: "x" })).toEqual({
    x: ["a", "b", "c"],
  });
});

test("один элемент", () => {
  expect(invertObject({ a: "z" })).toEqual({ z: "a" });
});

test("несколько групп дубликатов", () => {
  expect(
    invertObject({ a: "1", b: "1", c: "2", d: "2", e: "3" })
  ).toEqual({ 1: ["a", "b"], 2: ["c", "d"], 3: "e" });
});

test("массив с дублирующимися значениями", () => {
  expect(invertObject(["a", "b", "a"])).toEqual({
    a: ["0", "2"],
    b: "1",
  });
});

test("пустой объект", () => {
  expect(invertObject({})).toEqual({});
});
