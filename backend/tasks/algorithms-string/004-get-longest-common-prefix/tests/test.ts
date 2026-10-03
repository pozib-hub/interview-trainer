import { test, expect } from "vitest";
import { getLongestCommonPrefix, getLongestCommonPrefix2 } from "../solution";

test("общий префикс", () => {
  expect(getLongestCommonPrefix(["abc123", "abcd123", "abcde123", "abcdefg123"])).toBe("abc");
});

test("нет общего префикса", () => {
  expect(getLongestCommonPrefix(["dog", "racecar", "car"])).toBe("");
});

test("пустой массив", () => {
  expect(getLongestCommonPrefix([])).toBe("");
});

test("одна строка", () => {
  expect(getLongestCommonPrefix(["hello"])).toBe("hello");
});

test("getLongestCommonPrefix2 — тот же результат", () => {
  expect(getLongestCommonPrefix2(["abc123", "abcd123", "abcde123"])).toBe("abc");
});
