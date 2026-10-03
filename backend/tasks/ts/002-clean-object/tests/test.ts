import { test, expect } from "vitest";
import { cleanObject } from "../solution";

test("удаляет null и undefined", () => {
  const result = cleanObject({ a: "test", b: 23, c: null, d: undefined });
  expect(result).toEqual({ a: "test", b: 23 });
});

test("оставляет falsy значения (0, false, '')", () => {
  const result: any = cleanObject({ a: 0, b: false, c: "", d: null });
  expect(result.a).toBe(0);
  expect(result.b).toBe(false);
  expect(result.c).toBe("");
  expect(result.d).toBeUndefined();
});

test("пустой объект", () => {
  expect(cleanObject({})).toEqual({});
});

test("все значения null/undefined", () => {
  expect(cleanObject({ a: null, b: undefined })).toEqual({});
});

test("нет null/undefined", () => {
  expect(cleanObject({ a: 1, b: "hello" })).toEqual({ a: 1, b: "hello" });
});
