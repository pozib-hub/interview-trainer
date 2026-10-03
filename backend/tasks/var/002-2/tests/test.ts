import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "1) 3 раза [1, 1, 1]", "2) [] // сразу", "[1] // через 1 сек", "[1, 1] // через 2 сек"]);
});
