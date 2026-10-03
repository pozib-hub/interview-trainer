import { test, expect } from "vitest";
import { fn, input } from "../solution";

test("результат обработки массива", () => {
  expect(fn(input)).toBe("lzyx2badc");
});

test("фильтрует expired", () => {
  const result = fn([{ value: "ab", order: 1, expired: true }]);
  expect(result).toBe("");
});

test("пустой массив", () => {
  expect(fn([])).toBe("");
});
