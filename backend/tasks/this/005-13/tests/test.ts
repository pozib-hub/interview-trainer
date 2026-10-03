import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "Rox", "TypeError: Cannot read properties of undefined (reading 'name')", "Rox", "Colin", "[Function: bound getname]", "Colin", "TypeError: Cannot read properties of undefined (reading 'name')", "Rox"]);
});
