import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual([
    "1", "2", "4", "6", "7", "5", "3",
  ]);
});
