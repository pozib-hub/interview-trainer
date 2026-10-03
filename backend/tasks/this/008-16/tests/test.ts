import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  const result = getResult();
  expect(result[0]).toBe("ответ");
  expect(result[1]).toBeUndefined();
  expect(result[2]).toBe(20);
  expect(result[3]).toBe(30);
  expect(result[4]).toBeUndefined();
  expect(result[5]).toBe(30);
  expect(result[6]).toBe(20);
});
