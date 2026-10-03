import { test, expect } from "vitest";
import { reverseWords, reverseWordsMap } from "../solution";

test("reverseWords — переворот слов", () => {
  expect(reverseWords("hello world")).toBe("olleh dlrow");
});

test("reverseWordsMap — переворот слов", () => {
  expect(reverseWordsMap("hello world")).toBe("olleh dlrow");
});

test("reverseWordsMap — одно слово", () => {
  expect(reverseWordsMap("hello")).toBe("olleh");
});

test("reverseWordsMap — пустая строка", () => {
  expect(reverseWordsMap("")).toBe("");
});
