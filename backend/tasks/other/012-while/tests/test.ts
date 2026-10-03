import { test, expect } from "vitest";
import { getResult } from "../solution";

test("вывод цикла while с i++", () => {
  expect(getResult()).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
});
