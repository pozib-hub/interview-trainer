import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "[1, 2, 3, 4, 5]", "[1, 2, 3, 4, 5]"]);
});
