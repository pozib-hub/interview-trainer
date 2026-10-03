import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual([
    "Promise 1", "Promise 2", "final", "Promise 3", "Promise 4",
    "setTimeout 1", "setTimeout 3", "setTimeout 2",
  ]);
});
