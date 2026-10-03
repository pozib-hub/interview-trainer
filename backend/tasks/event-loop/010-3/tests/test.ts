import { test, expect } from "vitest";
import { getOrder, getSyncOrder, infiniteRecursion } from "../solution";

test("синхронный порядок вывода (до stack overflow)", () => {
  expect(getSyncOrder()).toEqual(["1", "4"]);
});

test("infiniteRecursion бросает ошибку", () => {
  expect(() => infiniteRecursion()).toThrow();
});

test("getOrder возвращает структуру с ошибкой", () => {
  const result = getOrder();
  expect(result.sync).toEqual(["1", "4", "5"]);
  expect(result.error).toContain("call stack");
});
