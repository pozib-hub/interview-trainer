import { test, expect } from "vitest";
import { getProperty } from "../solution";

test("возвращает значение по ключу", () => {
  expect(getProperty({ a: 1, b: 2 }, "a")).toBe(1);
  expect(getProperty({ a: 1, b: 2 }, "b")).toBe(2);
});

test("возвращает разные типы", () => {
  expect(getProperty({ str: "hello", num: 42, bool: true }, "str")).toBe("hello");
  expect(getProperty({ str: "hello", num: 42, bool: true }, "num")).toBe(42);
  expect(getProperty({ str: "hello", num: 42, bool: true }, "bool")).toBe(true);
});

test("работает с массивами", () => {
  expect(getProperty([10, 20, 30], 1)).toBe(20);
});

test("работает с вложенными объектами", () => {
  expect(getProperty({ a: { b: 1 } }, "a")).toEqual({ b: 1 });
});

test("возвращает undefined для несуществующего ключа", () => {
  expect(getProperty({} as any, "nonexistent" as any)).toBeUndefined();
});
