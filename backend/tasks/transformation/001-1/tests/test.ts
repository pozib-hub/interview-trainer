import { test, expect } from "vitest";
import { getResult } from "../solution";

test("преобразование Number и Boolean", () => {
  const result = getResult();
  expect(result[0]).toBe(0);
  expect(result[1]).toBe(0);
  expect(result[2]).toBe(1);
  expect(result[3]).toBe(0);
  expect(Number.isNaN(result[4])).toBe(true);
  expect(result[5]).toBe(24);
  expect(Number.isNaN(result[6])).toBe(true);
  expect(result[7]).toBe(false);
  expect(result[8]).toBe(false);
  expect(result[9]).toBe(false);
  expect(result[10]).toBe(false);
  expect(result[11]).toBe(false);
});
