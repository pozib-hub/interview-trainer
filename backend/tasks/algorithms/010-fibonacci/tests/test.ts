import { test, expect } from "vitest";
import { fibonacciRecursive, fibonacciIterative } from "../solution";

test("fibonacciRecursive(10) => 55", () => {
  expect(fibonacciRecursive(10)).toBe(55);
});

test("fibonacciIterative(10) => 55", () => {
  expect(fibonacciIterative(10)).toBe(55);
});
