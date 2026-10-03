import { test, expect } from "vitest";
import { getResult } from "../solution";

test("логические операторы || и &&", () => {
  expect(getResult()).toEqual([true, 1, false, "string", "string", 0, true, false, false, 0, 5]);
});
