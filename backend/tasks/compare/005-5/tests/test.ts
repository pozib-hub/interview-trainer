import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual([
    "function",
    "undefined",
    "ReferenceError: Cannot access 'f3' before initialization",
  ]);
});
