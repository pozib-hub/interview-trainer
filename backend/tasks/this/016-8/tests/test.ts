import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "TypeError: Cannot read properties of undefined (reading 'name')"]);
});
