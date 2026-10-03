import { test, expect } from "vitest";
import { identity } from "../solution";

test("возвращает строку", () => {
  expect(identity("hello")).toBe("hello");
});

test("возвращает массив", () => {
  expect(identity([1, 2, 3])).toEqual([1, 2, 3]);
});

test("возвращает объект с length", () => {
  expect(identity({ length: 42 })).toEqual({ length: 42 });
});

test("длина корректна", () => {
  expect(identity("hello").length).toBe(5);
  expect(identity([1, 2, 3]).length).toBe(3);
});
