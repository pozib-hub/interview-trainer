import { test, expect } from "vitest";
import { getResult } from "../solution";

test("сравнение undefined, null, false", () => {
  expect(getResult()).toEqual([false, false, false, true, true]);
});
