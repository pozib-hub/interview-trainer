import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  const result = getResult();
  expect(result[0]).toBe("ответ");
  expect(result[1]).toBe("Ford Mustang");
  expect(result[2]).toBeUndefined();
  expect(result[3]).toBeUndefined();
});
