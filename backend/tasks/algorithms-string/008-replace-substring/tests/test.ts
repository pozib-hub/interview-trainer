import { test, expect } from "vitest";
import { replaceSubstring, replaceSubstring2, replaceSubstring3, replaceSubstring4, replaceSubstring5 } from "../solution";

test("replaceSubstring — замена", () => {
  expect(replaceSubstring("hello world", "world", "there")).toBe("hello there");
});

test("replaceSubstring — множественная замена", () => {
  expect(replaceSubstring("abc abc abc", "abc", "123")).toBe("123 123 123");
});

test("replaceSubstring2 — замена", () => {
  expect(replaceSubstring2("hello world", "world", "there")).toBe("hello there");
});

test("replaceSubstring3 — замена", () => {
  expect(replaceSubstring3("abc abc", "abc", "123")).toBe("123 123");
});

test("replaceSubstring4 — замена", () => {
  expect(replaceSubstring4("hello world", "world", "there")).toBe("hello there");
});

test("replaceSubstring5 — замена", () => {
  expect(replaceSubstring5("hello world", "world", "there")).toBe("hello there");
});
