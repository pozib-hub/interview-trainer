import { test, expect } from "vitest";
import { isSymbol, isPalindrome } from "../solution";

test("isSymbol определяет буквы", () => {
  expect(isSymbol("a")).toBe(false);
  expect(isSymbol("A")).toBe(false);
  expect(isSymbol("1")).toBe(true);
  expect(isSymbol(" ")).toBe(true);
});

test("палиндром — короткие слова", () => {
  expect(isPalindrome("a")).toBe(true);
  expect(isPalindrome("bb")).toBe(true);
  expect(isPalindrome("606")).toBe(true);
  expect(isPalindrome("дед")).toBe(true);
});

test("не палиндром", () => {
  expect(isPalindrome("hello")).toBe(false);
});

test("палиндром с пробелами", () => {
  expect(isPalindrome("Аки лев велика")).toBe(true);
});
