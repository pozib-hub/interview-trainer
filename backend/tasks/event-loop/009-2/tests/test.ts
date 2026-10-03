import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual(["1", "2", "4", "timerStart", "timerEnd", "success"]);
});
