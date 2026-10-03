import { test, expect } from "vitest";
import { expect as myExpect } from "../solution";

test("toBe — равно", () => {
  expect(myExpect(5).toBe(5)).toEqual({ value: true });
});

test("toBe — не равно бросает", () => {
  expect(() => myExpect(5).toBe(6)).toThrow("Not Equal");
});

test("notToBe — не равно", () => {
  expect(myExpect(5).notToBe(6)).toEqual({ value: true });
});

test("notToBe — равно бросает", () => {
  expect(() => myExpect(5).notToBe(5)).toThrow("Equal");
});
