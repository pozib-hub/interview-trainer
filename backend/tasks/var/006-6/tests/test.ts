import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "start", "end", "от 0 до 99"]);
});
