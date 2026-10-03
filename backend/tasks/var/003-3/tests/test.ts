import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual([
    "ответ",
    "undefined",
    "ReferenceError: Cannot access 'b' before initialization",
    "// ================================",
    "SyntaxError: Identifier 'a' has already been declared",
  ]);
});
