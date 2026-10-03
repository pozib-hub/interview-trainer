import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  const result = getResult();
  expect(result[0]).toBe("ответ");
  expect(result[1]).toBe("Some Data");
  expect(result[2]).toBe(
    "TypeError: Cannot read properties of undefined (reading 'data')"
  );
});
