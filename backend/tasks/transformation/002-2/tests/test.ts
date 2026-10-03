import { test, expect } from "vitest";
import { getResult } from "../solution";

test("приведение типов: +, &&, ||, ??", () => {
  expect(getResult()).toEqual(["null1", "fooNaN", true, "", "c", ""]);
});
