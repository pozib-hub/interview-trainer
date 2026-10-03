import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода", () => {
  expect(getResult()).toEqual(["1", "2", "8", "5", "7", "3"]);
});
