import { test, expect } from "vitest";
import { getResult } from "../solution";

test("приведение типов", () => {
  expect(getResult()).toEqual([false, true, true, true, false, "number153", "18number", {}, true, "null"]);
});
