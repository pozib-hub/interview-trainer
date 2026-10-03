import { test, expect } from "vitest";
import { isInteger } from "../solution";

test("целое число", () => {
  expect(isInteger(232)).toBe(true);
  expect(isInteger(0)).toBe(true);
  expect(isInteger(-5)).toBe(true);
});

test("дробное число", () => {
  expect(isInteger(232.232)).toBe(false);
  expect(isInteger(3.14)).toBe(false);
});

test("NaN не целое", () => {
  expect(isInteger(NaN)).toBe(false);
});

test("Infinity не целое", () => {
  expect(isInteger(Infinity)).toBe(false);
});
