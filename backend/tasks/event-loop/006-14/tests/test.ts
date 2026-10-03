import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual([
    "1", "Promise", "4", "timeout", "777", "then1", "then2", "timeout2",
  ]);
});
