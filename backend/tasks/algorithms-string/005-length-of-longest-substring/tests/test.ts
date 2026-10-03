import { test, expect } from "vitest";
import { lengthOfLongestSubstring } from "../solution";

test("базовый случай", () => {
  expect(lengthOfLongestSubstring("abcabcbb")).toBe(3);
});

test("все одинаковые символы", () => {
  expect(lengthOfLongestSubstring("bbbbb")).toBe(1);
});

test("разные символы", () => {
  expect(lengthOfLongestSubstring("pwwkew")).toBe(3);
});

test("пустая строка", () => {
  expect(lengthOfLongestSubstring("")).toBe(0);
});

test("один символ", () => {
  expect(lengthOfLongestSubstring("a")).toBe(1);
});

test("без повторений", () => {
  expect(lengthOfLongestSubstring("abcdef")).toBe(6);
});
