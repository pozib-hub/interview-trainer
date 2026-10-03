import { test, expect } from "vitest";
import { fuzzySearch } from "../solution";

test("полное совпадение в начале", () => {
  expect(fuzzySearch("крокодил", "кроко")).toBe(true);
});

test("совпадение с пропусками", () => {
  expect(fuzzySearch("крокодил", "кдил")).toBe(true);
});

test("нет совпадения", () => {
  expect(fuzzySearch("крокодил", "ид")).toBe(false);
});

test("пустой query", () => {
  expect(fuzzySearch("hello", "")).toBe(true);
});

test("query длиннее слова", () => {
  expect(fuzzySearch("ab", "abc")).toBe(false);
});
