import { test, expect } from "vitest";
import { n, f, f1, f2, obj, obj2 } from "../solution";

test("f не меняет примитив (n остаётся 1)", () => {
  expect(n).toBe(1);
});

test("f1 мутирует объект (obj.a === 5)", () => {
  expect(obj.a).toBe(5);
});

test("f2 не меняет исходный объект (obj2.a === 1)", () => {
  expect(obj2.a).toBe(1);
});

test("f1 изменяет переданный объект напрямую", () => {
  const fresh = { a: 10 };
  f1(fresh);
  expect(fresh.a).toBe(5);
});

test("f2 не изменяет переданный объект", () => {
  const fresh = { a: 10 };
  f2(fresh);
  expect(fresh.a).toBe(10);
});
