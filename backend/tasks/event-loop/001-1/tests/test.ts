import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода event-loop 1", () => {
  expect(getResult()).toEqual([
    "final", "Promise 1", "Promise 2", "setTimeout 1", "setTimeout 3", "setTimeout 2",
  ]);
});
