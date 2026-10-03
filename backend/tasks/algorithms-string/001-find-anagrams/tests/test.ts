import { test, expect } from "vitest";
import { findAnagrams } from "../solution";

test("группирует анаграммы", () => {
  const result = findAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
  expect(result.length).toBe(3);
  expect(result).toContainEqual(["eat", "tea", "ate"]);
  expect(result).toContainEqual(["tan", "nat"]);
  expect(result).toContainEqual(["bat"]);
});

test("пустой массив", () => {
  expect(findAnagrams([])).toEqual([]);
});

test("без анаграмм", () => {
  const result = findAnagrams(["abc", "def", "ghi"]);
  expect(result.length).toBe(3);
});
