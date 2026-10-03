import { test, expect } from "vitest";
import { isAnagram, isAnagramSort } from "../solution";

test("isAnagram — анаграмма", () => {
  expect(isAnagram("listen", "silent")).toBe(true);
  expect(isAnagram("anagram", "nagaram")).toBe(true);
});

test("isAnagram — не анаграмма", () => {
  expect(isAnagram("hello", "world")).toBe(false);
});

test("isAnagram — разная длина", () => {
  expect(isAnagram("abc", "ab")).toBe(false);
});

test("isAnagramSort — анаграмма", () => {
  expect(isAnagramSort("listen", "silent")).toBe(true);
});

test("isAnagramSort — не анаграмма", () => {
  expect(isAnagramSort("hello", "world")).toBe(false);
});
