import { test, expect } from "vitest";
import { calculationOne, calculationTwo } from "../solution";

test("calculationOne(2) => 12", () => {
  expect(calculationOne(2)).toBe(12);
});

test("calculationTwo(2) => 28", () => {
  expect(calculationTwo(2)).toBe(28);
});
