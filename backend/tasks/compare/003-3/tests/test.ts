import { test, expect } from "vitest";
import { getResult } from "../solution";

test("сравнение объектов, NaN, null/undefined", () => {
  expect(getResult()).toEqual([false, false, false, false, false, true]);
});
