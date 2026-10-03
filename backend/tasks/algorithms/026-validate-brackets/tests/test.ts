import { test, expect } from "vitest";
import { validateBrackets } from "../solution";

test("валидные скобки", () => {
  expect(validateBrackets("{}")).toBe(true);
  expect(validateBrackets("[{[]}]")).toBe(true);
  expect(validateBrackets("()")).toBe(true);
  expect(validateBrackets("( ( a + b ) / 5 – d )")).toBe(true);
});

test("невалидные скобки", () => {
  expect(validateBrackets("}")).toBe(false);
  expect(validateBrackets("{[]]")).toBe(false);
  expect(validateBrackets("( ( ) a + b ) / 5 – d )")).toBe(false);
});

test("слишком короткая строка", () => {
  expect(validateBrackets("{")).toBe(false);
});

test("пустая строка", () => {
  expect(validateBrackets("")).toBe(false);
});
