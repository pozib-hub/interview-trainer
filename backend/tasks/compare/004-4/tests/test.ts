import { test, expect } from "vitest";
import { getResult } from "../solution";

test("typeof для разных значений", () => {
  expect(getResult()).toEqual(["number", "object", "object", "function", "function"]);
});
