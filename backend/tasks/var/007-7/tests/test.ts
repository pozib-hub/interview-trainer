import { test, expect } from "vitest";
import { getResult } from "../solution";

test("результат", () => {
  expect(getResult()).toEqual(["ответ", "[2, 1, 1]", "аргументы функции имеют приоритет над var, поэтому a остаётся 1 в момент объявления"]);
});
