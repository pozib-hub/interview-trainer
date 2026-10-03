import { test, expect } from "vitest";
import { isPangram, isPangramByObj, isPangramSet } from "../solution";

test("isPangram — панграмма", () => {
  expect(isPangram("The quick brown fox jumps over the lazy dog")).toBe(true);
});

test("isPangram — не панграмма", () => {
  expect(isPangram("Hello world")).toBe(false);
});

test("isPangramByObj — панграмма", () => {
  expect(isPangramByObj("The quick brown fox jumps over the lazy dog")).toBe(true);
});

test("isPangramByObj — не панграмма", () => {
  expect(isPangramByObj("Hello world")).toBe(false);
});

test("isPangramSet — панграмма", () => {
  expect(isPangramSet("The quick brown fox jumps over the lazy dog")).toBe(true);
});

test("isPangramSet — не панграмма", () => {
  expect(isPangramSet("Hello world")).toBe(false);
});
