import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  const result = getResult();
  expect(result[0]).toBe("ответ");
  expect(result[1]).toContain("Function");
  expect(result[2]).toBe(1);
  expect(result[3]).toBe("var");
  expect(result[4]).toBe("firstVar");
  expect(result[5]).toBe("SecondVar");
});
