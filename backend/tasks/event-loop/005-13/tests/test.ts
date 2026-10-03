import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual([
    "7", "2", "5", "1", "4", "6", "3",
  ]);
});
